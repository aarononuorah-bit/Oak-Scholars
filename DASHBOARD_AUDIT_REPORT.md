# Oak Scholars Dashboard Audit Report

**Date:** June 26, 2026  
**Repository:** aarononuorah-bit/Oak-Scholars  
**Audit Scope:** Student, Tutor, Parent, and Admin Dashboard Pages

---

## Executive Summary

The dashboard pages are **functionally incomplete** due to **critical missing tRPC router implementations** on the backend. While the frontend components are well-structured and properly designed, they will fail at runtime because the server-side API endpoints they depend on are not defined.

### Critical Issues Found: **7 CRITICAL, 3 MAJOR, 2 MINOR**

---

## 1. CRITICAL ISSUES

### Issue 1.1: Duplicate `sessionRouter` Definition (CRITICAL)
**Location:** `server/routers.ts`, lines 189–266  
**Severity:** CRITICAL - Causes TypeScript compilation error  
**Description:**  
The `sessionRouter` is defined **twice** with identical implementations:
- First definition: lines 189–231
- Second definition: lines 234–266

This will cause a TypeScript error: `Identifier 'sessionRouter' has already been declared`.

**Impact:** The application will not compile or run.

**Fix:**
```typescript
// DELETE lines 189-231 entirely. Keep only the second definition (lines 234-266).
// Or consolidate into a single definition.
```

---

### Issue 1.2: Missing Router Implementations (CRITICAL)
**Location:** `server/routers.ts`, lines 272–287  
**Severity:** CRITICAL - Missing 8 router implementations  
**Description:**  
The `appRouter` references 8 routers that are **not defined anywhere** in the codebase:

| Router | Used By | Status |
|--------|---------|--------|
| `referralRouter` | appRouter (line 272) | ❌ NOT DEFINED |
| `parentRouter` | appRouter (line 273) | ❌ NOT DEFINED |
| `tutorProfileRouter` | appRouter (line 274) | ❌ NOT DEFINED |
| `contactRouter` | appRouter (line 278) | ❌ NOT DEFINED |
| `tutorRouter` | appRouter (line 279) | ❌ NOT DEFINED |
| `tutoringRouter` | appRouter (line 280) | ❌ NOT DEFINED |
| `feedbackRouter` | appRouter (line 282) | ❌ NOT DEFINED |
| `paymentsRouter` | appRouter (line 283) | ❌ NOT DEFINED |
| `bannersRouter` | appRouter (line 284) | ❌ NOT DEFINED |
| `pushRouter` | appRouter (line 285) | ❌ NOT DEFINED |
| `accountRouter` | appRouter (line 286) | ❌ NOT DEFINED |
| `adminRouter` | appRouter (line 287) | ❌ NOT DEFINED |

**Impact:**  
- TypeScript compilation fails with "Cannot find name 'parentRouter'" errors
- All dashboard pages will fail to load because their tRPC calls will not resolve

**Frontend Dependencies:**
- **StudentDashboard.tsx** calls:
  - `trpc.tutoring.myTutors`
  - `trpc.session.studentSessions`
  - `trpc.feedback.submit`
  - `trpc.session.updateStatus`
  - `trpc.session.rescheduleSession`

- **TutorDashboard.tsx** calls:
  - `trpc.tutoring.myStudents`
  - `trpc.session.tutorSessions`
  - `trpc.feedback.received`
  - `trpc.tutorProfile.update`
  - `trpc.storage.upload`

- **ParentDashboard.tsx** calls:
  - `trpc.parent.myChildren`
  - `trpc.parent.pendingRequests`
  - `trpc.parent.sendLinkRequest`
  - `trpc.parent.confirmLink`
  - `trpc.parent.childData`

- **AdminDashboard.tsx** calls:
  - `trpc.admin.getAllUsers`
  - `trpc.admin.getUserProfile`

---

### Issue 1.3: Missing `auth` Router Implementation (CRITICAL)
**Location:** `server/routers.ts`, line 275  
**Severity:** CRITICAL  
**Description:**  
The `auth` router is defined as an empty placeholder:
```typescript
auth: router({ /* ... your existing auth routes ... */ }),
```

**Impact:**  
- Authentication will fail
- `useAuth()` hook in all dashboards depends on `trpc.auth.me` and `trpc.auth.logout`
- Dashboard pages will not load

---

### Issue 1.4: Missing `storage` Router (CRITICAL)
**Location:** `server/routers.ts`  
**Severity:** CRITICAL  
**Description:**  
The `storage` router is not defined in the `appRouter`, but **TutorDashboard.tsx** calls:
```typescript
trpc.storage.upload.useMutation()
```

**Impact:**  
- Tutor profile photo upload will fail
- TutorDashboard will crash when attempting to upload a profile photo

---

### Issue 1.5: Incomplete `db.ts` - Missing Syntax (CRITICAL)
**Location:** `server/db.ts`, line 27  
**Severity:** CRITICAL - Syntax Error  
**Description:**  
There is a **missing comma** in the import statement:
```typescript
creditBalances  // <-- MISSING COMMA HERE
tutoringSessions,
```

Should be:
```typescript
creditBalances,
tutoringSessions,
```

**Impact:**  
- TypeScript compilation fails
- The entire database module fails to load

---

### Issue 1.6: Missing Role Guard in ParentDashboard (CRITICAL)
**Location:** `client/src/pages/ParentDashboard.tsx`, line 71  
**Severity:** CRITICAL - Security Issue  
**Description:**  
The ParentDashboard only checks if a user exists, but **does not verify the user's role**:
```typescript
if (!user) return <div>Access Denied</div>;
```

Should be:
```typescript
if (!user || user.role !== "parent") return <div>Access Denied</div>;
```

**Impact:**  
- Non-parent users (students, tutors) can access the parent dashboard
- Security vulnerability: unauthorized access to parent-specific data

---

### Issue 1.7: Incomplete `sessionRouter` - Missing Procedures (CRITICAL)
**Location:** `server/routers.ts`, lines 234–266  
**Severity:** CRITICAL  
**Description:**  
The `sessionRouter` only defines `requestSession` and `acceptBooking`, but the frontend calls:
- `trpc.session.tutorSessions` (TutorDashboard.tsx:50)
- `trpc.session.studentSessions` (StudentDashboard.tsx:39)
- `trpc.session.updateStatus` (StudentDashboard.tsx:53)
- `trpc.session.rescheduleSession` (StudentDashboard.tsx:58)

**Missing Procedures:**
- `tutorSessions` - Get sessions for a tutor
- `studentSessions` - Get sessions for a student
- `updateStatus` - Update session status (cancel, complete, etc.)
- `rescheduleSession` - Reschedule a session

**Impact:**  
- Dashboards cannot fetch or manage sessions
- Session management features will crash

---

## 2. MAJOR ISSUES

### Issue 2.1: Missing `tutoringRouter` Procedures (MAJOR)
**Location:** `server/routers.ts`  
**Severity:** MAJOR  
**Description:**  
The `tutoringRouter` is referenced but not defined. Frontend calls:
- `trpc.tutoring.myStudents` (TutorDashboard.tsx:49)
- `trpc.tutoring.myTutors` (StudentDashboard.tsx:38)

**Impact:**  
- Tutors cannot view their assigned students
- Students cannot view their assigned tutors
- Dashboard stat cards will be empty

---

### Issue 2.2: Missing `feedbackRouter` Procedures (MAJOR)
**Location:** `server/routers.ts`  
**Severity:** MAJOR  
**Description:**  
The `feedbackRouter` is referenced but not defined. Frontend calls:
- `trpc.feedback.received` (TutorDashboard.tsx:51)
- `trpc.feedback.submit` (StudentDashboard.tsx:42)

**Impact:**  
- Tutors cannot view feedback received from students
- Students cannot submit feedback for completed sessions
- Rating system will not work

---

### Issue 2.3: Missing `adminRouter` Procedures (MAJOR)
**Location:** `server/routers.ts`  
**Severity:** MAJOR  
**Description:**  
The `adminRouter` is referenced but not defined. Frontend calls:
- `trpc.admin.getAllUsers` (AdminDashboard.tsx:95)
- `trpc.admin.getUserProfile` (AdminDashboard.tsx:21)

**Impact:**  
- Admin dashboard cannot load user list
- Admin cannot view user profiles
- Admin features completely non-functional

---

## 3. MINOR ISSUES

### Issue 3.1: Incorrect Role Check in TutorDashboard (MINOR)
**Location:** `client/src/pages/TutorDashboard.tsx`, line 64  
**Severity:** MINOR - Inconsistent with other dashboards  
**Description:**  
The TutorDashboard checks `user.role !== "tutor"` but returns a generic error message. Should be consistent with StudentDashboard's pattern.

**Current:**
```typescript
if (!user || user.role !== "tutor") {
  return (
    <div className="min-h-screen bg-[#F9F7F2]">
      <Navbar />
      <div className="container py-32 text-center max-w-md mx-auto">
        <Shield size={28} className="text-amber-400 mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-bold text-[#281A39] mb-4">Tutor Access Only</h1>
        <Link href="/"><Button>Back to Home</Button></Link>
      </div>
      <Footer />
    </div>
  );
}
```

**Recommendation:** Add explicit role check to AdminDashboard as well for consistency.

---

### Issue 3.2: Hardcoded Session Rate in TutorDashboard (MINOR)
**Location:** `client/src/pages/TutorDashboard.tsx`, line 81  
**Severity:** MINOR - Maintenance issue  
**Description:**  
The session rate is hardcoded:
```typescript
const SESSION_RATE_PER_HOUR = 25;
```

This should be fetched from the server or configuration.

**Impact:**  
- If pricing changes, code must be updated
- No single source of truth for pricing

---

## 4. ROUTING & ACCESS CONTROL AUDIT

### DashboardRouter (client/src/pages/DashboardRouter.tsx)
**Status:** ✅ WORKING  
**Details:**
- Correctly routes based on user role
- Properly redirects unauthenticated users
- Role-based routing logic is sound

### Direct Routes (client/src/App.tsx, lines 37–46)
**Status:** ⚠️ NEEDS VERIFICATION  
**Details:**
- Routes `/admin`, `/tutor-dashboard`, `/student-dashboard`, `/parent-dashboard` are available
- Access control is enforced at the component level (inside each dashboard)
- **Recommendation:** Consider adding route-level guards in addition to component-level guards

---

## 5. FRONTEND COMPONENT QUALITY

### StudentDashboard.tsx
**Status:** ✅ WELL-STRUCTURED  
- Proper error handling
- Loading states implemented
- Role guard in place
- Responsive design

### TutorDashboard.tsx
**Status:** ✅ WELL-STRUCTURED  
- Comprehensive profile management
- Payment details handling
- File upload support
- Good UX with tabs

### ParentDashboard.tsx
**Status:** ⚠️ MISSING ROLE GUARD  
- Well-designed child linking flow
- Good two-step confirmation process
- **Issue:** Missing `user.role === 'parent'` check (see Issue 1.6)

### AdminDashboard.tsx
**Status:** ✅ WELL-STRUCTURED  
- User profile modal
- User list with pagination support
- Proper loading states

---

## 6. RECOMMENDED FIXES (Priority Order)

### Phase 1: Critical Fixes (MUST DO)
1. **Fix db.ts syntax error** (add missing comma on line 27)
2. **Remove duplicate sessionRouter** (delete lines 189–231)
3. **Implement missing routers:**
   - `parentRouter`
   - `tutorProfileRouter`
   - `contactRouter`
   - `tutorRouter`
   - `tutoringRouter`
   - `feedbackRouter`
   - `paymentsRouter`
   - `bannersRouter`
   - `pushRouter`
   - `accountRouter`
   - `adminRouter`
   - `referralRouter`
4. **Implement auth router** with `me` and `logout` procedures
5. **Implement storage router** with `upload` procedure
6. **Add missing sessionRouter procedures:**
   - `tutorSessions`
   - `studentSessions`
   - `updateStatus`
   - `rescheduleSession`
7. **Add role guard to ParentDashboard** (line 71)

### Phase 2: Enhancements (SHOULD DO)
1. Add route-level access guards
2. Move hardcoded pricing to server configuration
3. Add consistent error handling across all routers
4. Add input validation to all procedures

---

## 7. TESTING RECOMMENDATIONS

After fixes are applied:

1. **Unit Tests:**
   - Test each router procedure independently
   - Verify role-based access control

2. **Integration Tests:**
   - Test dashboard page loads with proper authentication
   - Test data fetching for each role
   - Test session management workflows

3. **E2E Tests:**
   - Student dashboard: view tutors, sessions, leave feedback
   - Tutor dashboard: view students, sessions, update profile
   - Parent dashboard: link child, view child's sessions
   - Admin dashboard: view all users, access user profiles

---

## 8. CONCLUSION

The dashboard pages have **excellent frontend design and structure**, but they are **completely non-functional** due to missing backend router implementations. The application will not even compile due to:

1. Syntax error in `db.ts`
2. Duplicate `sessionRouter` definition
3. 12 missing router implementations

**Estimated effort to fix:** 2–3 days for an experienced developer

**Priority:** 🔴 **CRITICAL** - Must be fixed before any deployment

---

## Appendix: Frontend Dependencies Summary

| Dashboard | tRPC Calls | Status |
|-----------|-----------|--------|
| StudentDashboard | `tutoring.myTutors`, `session.studentSessions`, `feedback.submit`, `session.updateStatus`, `session.rescheduleSession` | ❌ BLOCKED |
| TutorDashboard | `tutoring.myStudents`, `session.tutorSessions`, `feedback.received`, `tutorProfile.update`, `storage.upload` | ❌ BLOCKED |
| ParentDashboard | `parent.myChildren`, `parent.pendingRequests`, `parent.sendLinkRequest`, `parent.confirmLink`, `parent.childData` | ❌ BLOCKED |
| AdminDashboard | `admin.getAllUsers`, `admin.getUserProfile` | ❌ BLOCKED |

---

**Report Generated:** 2026-06-26  
**Auditor:** Manus AI Agent  
**Status:** ⚠️ CRITICAL ISSUES FOUND
