
import { Role, User, UserStatus } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { get } from "node:http";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { access } from "node:fs";
import { IChangePasswordPayload, IRegisterPayload } from "./auth.interface";
import { log } from "node:console";
import { email } from "zod";



const registerPatient = async (payload: IRegisterPayload) => {
  const { name, email, password } = payload;
  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new Error("Failed to register patient");
  }
  try {
    const patientTx = await prisma.$transaction(async (tx) => {
      return tx.patient.create({
        data: {
          name: payload.name,
          email: payload.email,
          userId: data.user.id,
        },
      });
    });

    const tokenPayload = {
      userId: data.user.id,
      role: data.user.role,
      name: data.user.name,
      email: data.user.email,
      status: data.user.status,
      isDeleted: data.user.isDeleted,
      emailVerified: data.user.emailVerified,
    };
    const accessToken = tokenUtils.getAccesstoken(tokenPayload);
    const refreshToken = tokenUtils.getRefreshToken(tokenPayload);
    return {
      ...data,
      patient: patientTx,
      accessToken,
      refreshToken,
    };
  } catch (error) {
    console.log("TRANSACTION ERROR ", error);
    await prisma.user.delete({
      where: {
        id: data.user.id,
      },
    });

    throw error;
  }
};
const loginUser = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;
  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });
  if (data.user.status === UserStatus.BLOCKED) {
    throw new Error("User Is Blocked");
  }
  const tokenPayload = {
    userId: data.user.id,
    role: data.user.role,
    name: data.user.name,
    email: data.user.email,
    status: data.user.status,
    isDeleted: data.user.isDeleted,
    emailVerified: data.user.emailVerified,
  };
  const accessToken = tokenUtils.getAccesstoken(tokenPayload);
  const refreshToken = tokenUtils.getRefreshToken(tokenPayload);

  return {
    ...data,
    accessToken,
    refreshToken,
  };
};

const logoutUser=async(sessionToken: string)=>{
    const result=await auth.api.signOut({
        headers:new Headers({
            Authorization: `Bearer ${sessionToken}`
        })
    })
    return result;
}

const changePassword = async (payload: IChangePasswordPayload,sessionToken: string) => {
const session=await auth.api.getSession({
   headers:new Headers(
    {
         Authorization: `Bearer ${sessionToken}`
    }
   )
})

if(!session){
    throw new AppError(status.UNAUTHORIZED,"Invalid Session")
}
const {currentPassword,newPassword}=payload
const result=await auth.api.changePassword({
  body:{
    currentPassword,
    newPassword,
    revokeOtherSessions:true
  },
  headers:new Headers(
    {
         Authorization: `Bearer ${sessionToken}`
    })

})
  const tokenPayload = {
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
    status: session.user.status,
    isDeleted: session.user.isDeleted,
    emailVerified: session.user.emailVerified,
  };
  const accessToken = tokenUtils.getAccesstoken(tokenPayload);
  const refreshToken = tokenUtils.getRefreshToken(tokenPayload);
return {
  ...result,
  accessToken,
  refreshToken
}
}



const getMe = async (id: string) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: id,
    },
    include: {
      patient: {
        include: {
          appointments: true,
          reviews: true,
          prescriptions: true,
          medicalReports: true,
          patientHealthData: true,
        },
      },
      doctor: {
        include: {
          doctorSpecialities: true,
          appointments: true,
          reviews: true,
          prescriptions: true,
        },
      },
    },
  });
  if (!isUserExist) {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }
  return isUserExist;
};
const getNewToken = async (refreshToken: string, sessionToken: string) => {
  const isSessionExists = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
    include: {
      user: true,
    },
  });
  if (!isSessionExists) {
    throw new AppError(status.UNAUTHORIZED, "Invalid Session");
  }

  const verifyRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    envVars.REFRESH_TOKEN_SECRET,
  );

  if (!verifyRefreshToken.success && verifyRefreshToken.error) {
    throw new AppError(status.UNAUTHORIZED, "Invalid Refresh Token");
  }
//   console.log("Verify Refresh Token🚀 ", verifyRefreshToken);
  const { data } = verifyRefreshToken as JwtPayload;
//   console.log("Decoded Refresh Token Data ", data);
  const newAccessToken = tokenUtils.getAccesstoken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });
  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
      updatedAt: new Date(),
    },
  });
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    sessionToken: token,
  };
};
//verify email
const verifyEmail=async(email:string,otp:string)=>{
const result=await auth.api.verifyEmailOTP({
  body:{
    email,
    otp
  }
})
if(result.status && !result.user){
  await prisma.user.update({
    where:{
      email:email
    },
    data:{
      emailVerified:true
    }
  })
}
return result
}



export const authService = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,changePassword,logoutUser,verifyEmail
};
