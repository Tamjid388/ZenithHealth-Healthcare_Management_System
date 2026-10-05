"use client";

import {
  getDoctorByIdAction,
  updateDoctorAction,
} from "@/app/(dashboardLayout)/admin/dashboard/doctors-management/_action";
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
import { Gender, IDoctorDetails } from "@/types/doctors.types";
import {
  TUpdateDoctorInput,
  updateDoctorZodSchema,
} from "@/zod/doctor.validation";
import { AnyFieldApi, useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { unstable_rethrow } from "next/navigation";
import { useMemo, useState } from "react";

type EditDoctorFormProps = {
  doctorId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

type EditDoctorFormValues = {
  doctor: TUpdateDoctorInput["doctor"];
  specialities: string[];
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

const buildDefaultValues = (doctor: IDoctorDetails): EditDoctorFormValues => ({
  doctor: {
    name: doctor.name ?? "",
    contactNumber: doctor.contactNumber ?? "",
    address: doctor.address ?? "",
    registrationNumber: doctor.registrationNumber ?? "",
    experience: doctor.experience ?? 0,
    gender: doctor.gender ?? Gender.MALE,
    appointmentFee: doctor.appointmentFee ?? 0,
    qualifications: doctor.qualifications ?? "",
    currentWorkingPlace: doctor.currentWorkingPlace ?? "",
    designation: doctor.designation ?? "",
  },
  specialities:
    doctor.doctorSpecialities?.map((item) => item.specialityId) ?? [],
});

const buildSpecialityChanges = (
  initialIds: string[],
  nextIds: string[],
): TUpdateDoctorInput["specialities"] => {
  const changes: NonNullable<TUpdateDoctorInput["specialities"]> = [];

  for (const specialityId of initialIds) {
    if (!nextIds.includes(specialityId)) {
      changes.push({ specialityId, shouldDelete: true });
    }
  }

  for (const specialityId of nextIds) {
    if (!initialIds.includes(specialityId)) {
      changes.push({ specialityId });
    }
  }

  return changes.length > 0 ? changes : undefined;
};

type EditDoctorFormFieldsProps = {
  doctor: IDoctorDetails;
  doctorId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const EditDoctorFormFields = ({
  doctor,
  doctorId,
  onSuccess,
  onCancel,
}: EditDoctorFormFieldsProps) => {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

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
  const initialSpecialityIds = useMemo(
    () => doctor.doctorSpecialities?.map((item) => item.specialityId) ?? [],
    [doctor],
  );

  const { mutateAsync } = useMutation({
    mutationFn: async (data: TUpdateDoctorInput) =>
      updateDoctorAction(doctorId, data),
  });

  const form = useForm({
    defaultValues: buildDefaultValues(doctor),
    validators: {
      onSubmit: ({ value }) => {
        const payload: TUpdateDoctorInput = {
          doctor: value.doctor,
          specialities: buildSpecialityChanges(
            initialSpecialityIds,
            value.specialities,
          ),
        };

        const result = updateDoctorZodSchema.safeParse(payload);
        if (!result.success) {
          return result.error.message;
        }

        if ((value.specialities?.length ?? 0) < 1) {
          return "Select at least one speciality";
        }

        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const payload: TUpdateDoctorInput = {
          doctor: value.doctor,
          specialities: buildSpecialityChanges(
            initialSpecialityIds,
            value.specialities,
          ),
        };

        const result = await mutateAsync(payload);
        if (!result.success) {
          setServerError(result.message);
          return;
        }

        await queryClient.invalidateQueries({ queryKey: ["doctors"] });
        await queryClient.invalidateQueries({ queryKey: ["doctor", doctorId] });
        setServerError(null);
        onSuccess?.();
      } catch (error) {
        unstable_rethrow(error);
        setServerError((error as Error).message || "Failed to update doctor");
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
      <div className="rounded-lg border bg-muted/30 px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Email
        </p>
        <p className="text-sm">{doctor.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="doctor.name"
          validators={{
            onChange: updateDoctorZodSchema.shape.doctor.shape.name,
          }}
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
          name="doctor.registrationNumber"
          validators={{
            onChange:
              updateDoctorZodSchema.shape.doctor.shape.registrationNumber,
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
            onChange:
              updateDoctorZodSchema.shape.doctor.shape.qualifications,
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
              updateDoctorZodSchema.shape.doctor.shape.currentWorkingPlace,
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
            onChange: updateDoctorZodSchema.shape.doctor.shape.designation,
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
            onChange: updateDoctorZodSchema.shape.doctor.shape.contactNumber,
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
            onChange: updateDoctorZodSchema.shape.doctor.shape.address,
          }}
        >
          {(field) => (
            <AppField field={field} label="Address" placeholder="Optional" />
          )}
        </form.Field>

        <form.Field
          name="doctor.experience"
          validators={{
            onChange: updateDoctorZodSchema.shape.doctor.shape.experience,
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
            onChange: updateDoctorZodSchema.shape.doctor.shape.appointmentFee,
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
        validators={{
          onChange: updateDoctorZodSchema.shape.doctor.shape.gender,
        }}
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

      <form.Field name="specialities">
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
        <Alert variant="destructive" className="text-sm text-red-500">
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
              Save changes
            </AppSubmitButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
};

export const EditDoctorForm = ({
  doctorId,
  onSuccess,
  onCancel,
}: EditDoctorFormProps) => {
  const {
    data: doctorResponse,
    isPending: isDoctorPending,
    isError: isDoctorError,
    error: doctorError,
  } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: async () => {
      const result = await getDoctorByIdAction(doctorId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    staleTime: 1000 * 30,
  });

  const doctor = doctorResponse?.data;

  if (isDoctorPending) {
    return (
      <p className="text-sm text-muted-foreground">Loading doctor details...</p>
    );
  }

  if (isDoctorError) {
    return (
      <Alert variant="destructive" className="text-sm">
        {doctorError instanceof Error
          ? doctorError.message
          : "Failed to load doctor details."}
      </Alert>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <EditDoctorFormFields
      key={doctor.id}
      doctor={doctor}
      doctorId={doctorId}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
};

export default EditDoctorForm;
