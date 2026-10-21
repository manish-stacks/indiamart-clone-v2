# Security, Privacy & Compliance Architecture

## 1. Authentication & Session Management
- **Password Security**: Passwords are never stored in plaintext. They are hashed using `bcrypt` with salt rounds 10.
- **JWT Architecture**:
  - Short-lived Access Token (15 minutes).
  - Long-lived Refresh Token (7 days).
  - Refresh tokens are hashed and stored in the database `sessions` table.
  - Refresh token rotation is enforced: requesting a new access token invalidates the old refresh token and issues a new pair.
- **Cookie Security**: `accessToken` cookie is marked `HttpOnly` with `SameSite: 'lax'` to prevent JavaScript theft.

---

## 2. Multi-tenancy & Business Isolation
- Multi-tenancy is modeled through `BusinessMember` relations.
- Every business-mutating route enforces `BusinessMemberGuard`, verifying:
  1. The authenticated user is an authorized member of that specific business.
  2. The user has the required business role (`OWNER` or `MANAGER`).
- Sellers cannot view or edit products, leads, private CRM notes, or quotations belonging to other businesses.

---

## 3. Input Validation & SQL Injection Prevention
- All incoming payloads are validated via NestJS `ValidationPipe` leveraging `class-validator` and `class-transformer`.
- Whitelist filtering strips non-whitelisted properties, protecting against mass assignment.
- Database queries use Prisma ORM prepared statements, preventing SQL injection vulnerabilities.

---

## 4. Indian Statutory & Privacy Considerations
- **GSTIN Validation**: Enforced via regex format checking (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`).
- **Buyer Privacy Protection**: Buyer phone numbers and direct contact details are shielded until a formal quotation or inquiry match is authorized.

