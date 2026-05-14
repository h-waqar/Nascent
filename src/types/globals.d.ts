// Augments Clerk's CustomJwtSessionClaims so sessionClaims.metadata.role is typed.
export {};

export type Roles = "admin";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
