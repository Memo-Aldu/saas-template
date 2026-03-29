import { z } from "zod";

import { TypedSuccessResponseSchema } from "./api";

const CurrentUserGroupsSchema = z
  .union([z.array(z.string()), z.string()])
  .transform((groups) => {
    if (Array.isArray(groups)) {
      return groups.map((group) => group.trim().toLowerCase()).filter(Boolean);
    }

    return groups
      .split(",")
      .map((group) => group.trim().toLowerCase())
      .filter(Boolean);
  });

export const CurrentUserDataSchema = z.object({
  subject: z.string().nullable(),
  username: z.string().nullable(),
  email: z.string().email().nullable(),
  groups: CurrentUserGroupsSchema,
});

export type CurrentUserData = z.infer<typeof CurrentUserDataSchema>;

export const CurrentUserResponseSchema =
  TypedSuccessResponseSchema(CurrentUserDataSchema);

export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;
