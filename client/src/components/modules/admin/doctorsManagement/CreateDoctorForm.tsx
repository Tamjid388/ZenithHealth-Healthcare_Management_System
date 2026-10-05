"use client";

import { createDoctorAction } from "@/app/(dashboardLayout)/admin/dashboard/doctors-management/_action";
import AppField from "@/components/shared/form/Appfield";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import {
  Alert,
  Button,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { getSpecialities } from "@/services/doctors.service";
import { Gender } from "@/types/doctors.types";
import {
  createDoctorZodSchema,
  TCreateDoctorInput,
} from "@/zod/doctor.validation";
import { AnyFieldApi, useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { useState } from "react";

type CreateDoctorFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    if (typeof error.message === "string") return error.message;
  }
  return String(error);
};

const FieldError = ({ field }: { field: AnyFieldApi }) => {
  const firstError =
    field.state.meta.isTouched && field.state.meta.errors.length > 0
      ? field.state.meta.errors[0]
      : null;

  if (!firstError) {
    return null;
  }

  return (
    <p className="text-sm text-red-500" role="alert">
      {getErrorMessage(firstError)}
    </p>
  );
};

const defaultValues: TCreateDoctorInput = {
  password: "",
  doctor: {
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    registrationNumber: "",
    experience: "",
    gender: Gender.MALE,
    appointmentFee: "",
    qualifications: "",
    currentWorkingPlace: "",
    designation: "",
  },
  specialities: [],
};

export const CreateDoctorForm = ({
  onSuccess,
  onCancel,
}: CreateDoctorFormProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    data: specialitiesResponse,
    isPending: isSpecialitiesPending,
    isError: isSpecialitiesError,
  } = useQuery({
    queryKey: ["specialities"],
    queryFn: getSpecialities,
    staleTime: 1000 * 60 * 5,
  });

  const specialities = specialitiesResponse?.data ?? [];

  const { mutateAsync } = useMutation({
    mutationFn: async (data: TCreateDoctorInput) => createDoctorAction(data),
  });

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: createDoctorZodSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await mutateAsync(value);
        if (!result.success) {
          setServerError(result.message);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["doctors"] });
        form.reset();
        setServerError(null);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setServerError((error as Error).message || "Failed to create doctor");
      }
    },
  });

  return (
    <form
      method="POST"
      action="#"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="doctor.name"
          validators={{ onChange: createDoctorZodSchema.shape.doctor.shape.name }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Name"
              placeholder="Enter doctor name"
            />
          )}
        </form.Field>

        <form.Field
          name="doctor.email"
          validators={{ onChange: createDoctorZodSchema.shape.doctor.shape.email }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Email"
              type="email"
              placeholder="Enter email"
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: createDoctorZodSchema.shape.password }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              append={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" aria-hidden="true" />
                  ) : (
                    <EyeIcon className="size-4" aria-hidden="true" />
                  )}
                </Button>
              }
            />
          )}
        </form.Field>

        <form.Field
          name="doctor.registrationNumber"
          validators={{
            onChange: createDoctorZodSchema.shape.doctor.shape.registrationNumber,
          }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Registration number"
              placeholder="Enter registration number"
            />
          )}
        </form.Field>

        <form.Field
          name="doctor.qualifications"
          validators={{
            onChange: createDoctorZodSchema.shape.doctor.shape.qualifications,
          }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Qualifications"
              placeholder="Enter qualifications"
            />
          )}
        </form.Field>

        <form.Field
          name="doctor.currentWorkingPlace"
          validators={{
            onChange:
              createDoctorZodSchema.shape.doctor.shape.currentWorkingPlace,
          }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Current working place"
              placeholder="Enter current working place"
            />
          )}
        </form.Field>

        <form.Field
          name="doctor.designation"
          validators={{
            onChange: createDoctorZodSchema.shape.doctor.shape.designation,
          }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Designation"
              placeholder="Enter designation"
            />
          )}
        </form.Field>

        <form.Field
          name="doctor.contactNumber"
          validators={{
            onChange: createDoctorZodSchema.shape.doctor.shape.contactNumber,
          }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Contact number"
              placeholder="Optional"
            />
          )}
        </form.Field>

        <form.Field
          name="doctor.address"
          validators={{
            onChange: createDoctorZodSchema.shape.doctor.shape.address,
          }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Address"
              placeholder="Optional"
            />
          )}
        </form.Field>

        <form.Field
          name="doctor.experience"
          validators={{
            onChange: createDoctorZodSchema.shape.doctor.shape.experience,
          }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Experience (years)"
              type="number"
              placeholder="0"
            />
          )}
        </form.Field>

        <form.Field
          name="doctor.appointmentFee"
          validators={{
            onChange: createDoctorZodSchema.shape.doctor.shape.appointmentFee,
          }}
        >
          {(field) => (
            <AppField
              field={field}
              label="Appointment fee"
              type="number"
              placeholder="0"
            />
          )}
        </form.Field>
      </div>

      <form.Field
        name="doctor.gender"
        validators={{ onChange: createDoctorZodSchema.shape.doctor.shape.gender }}
      >
        {(field) => (
          <div className="space-y-1.5">
            <label
              htmlFor={field.name}
              className={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
                  ? "text-red-500"
                  : "text-gray-900"
              }
            >
              Gender
            </label>
            <Select
              value={field.state.value || null}
              onValueChange={(nextValue) => {
                if (nextValue == null) {
                  return;
                }
                field.handleChange(nextValue as Gender);
              }}
            >
              <SelectTrigger
                id={field.name}
                className="w-full"
                onBlur={field.handleBlur}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Gender.MALE}>Male</SelectItem>
                <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                <SelectItem value={Gender.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
            <FieldError field={field} />
          </div>
        )}
      </form.Field>

      <form.Field
        name="specialities"
        validators={{ onChange: createDoctorZodSchema.shape.specialities }}
      >
        {(field) => (
          <fieldset className="space-y-2">
            <legend
              className={
                field.state.meta.isTouched && field.state.meta.errors.length > 0
                  ? "text-sm text-red-500"
                  : "text-sm text-gray-900"
              }
            >
              Specialities
            </legend>
            {isSpecialitiesPending ? (
              <p className="text-sm text-muted-foreground">
                Loading specialities...
              </p>
            ) : null}
            {isSpecialitiesError ? (
              <p className="text-sm text-destructive">
                Failed to load specialities. Please try again.
              </p>
            ) : null}
            {!isSpecialitiesPending &&
            !isSpecialitiesError &&
            specialities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No specialities available.
              </p>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              {specialities.map((speciality) => {
                const checked = field.state.value.includes(speciality.id);
                return (
                  <label
                    key={speciality.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(checkedState) => {
                        const nextValues = checkedState
                          ? [...field.state.value, speciality.id]
                          : field.state.value.filter(
                              (id) => id !== speciality.id,
                            );
                        field.handleChange(nextValues);
                      }}
                      onBlur={field.handleBlur}
                    />
                    <span>{speciality.title}</span>
                  </label>
                );
              })}
            </div>
            <FieldError field={field} />
          </fieldset>
        )}
      </form.Field>

      {serverError ? (
        <Alert variant="destructive" className="text-red-500 text-sm">
          {serverError}
        </Alert>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <AppSubmitButton
              disabled={!canSubmit || isSubmitting}
              isPending={isSubmitting}
              className="sm:w-auto"
            >
              Create Doctor
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export default CreateDoctorForm;
