# Router Implementation Guide

This document provides templates and guidance for implementing the missing routers in `server/routers.ts`.

## Overview of Missing Routers

The following routers need to be implemented:

1. `parentRouter` - Parent account management and child linking
2. `tutorProfileRouter` - Tutor profile management
3. `contactRouter` - Contact form submissions
4. `tutorRouter` - Tutor application and management
5. `tutoringRouter` - Tutoring relationships and student/tutor queries
6. `feedbackRouter` - Feedback submission and retrieval
7. `paymentsRouter` - Payment and billing management
8. `bannersRouter` - Announcement banners
9. `pushRouter` - Push notifications
10. `accountRouter` - Account settings and management
11. `adminRouter` - Admin operations
12. `referralRouter` - Referral system
13. `authRouter` - Authentication (currently empty placeholder)
14. `storageRouter` - File upload and storage

---

## Implementation Templates

### 1. Parent Router

```typescript
const parentRouter = router({
  myChildren: parentProcedure.query(async ({ ctx }) => {
    return await getLinkedChildrenForParent(ctx.user.id);
  }),

  pendingRequests: parentProcedure.query(async ({ ctx }) => {
    return await getPendingLinkRequestsForStudent(ctx.user.id);
  }),

  sendLinkRequest: parentProcedure
    .input(z.object({ childEmail: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const request = await createParentLinkRequest({
        parentId: ctx.user.id,
        childEmail: input.childEmail,
        confirmationCode: code,
      });
      
      // Send email with confirmation code
      await sendParentLinkCode(input.childEmail, code).catch(e => console.error(e));
      
      return request;
    }),

  confirmLink: parentProcedure
    .input(z.object({ childEmail: z.string().email(), code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await confirmLinkByCode({
        parentId: ctx.user.id,
        childEmail: input.childEmail,
        code: input.code,
      });
    }),

  childData: parentProcedure
    .input(z.object({ studentId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify parent has access to this child
      const children = await getLinkedChildrenForParent(ctx.user.id);
      if (!children.some(c => c.id === input.studentId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const sessions = await db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.studentId, input.studentId));

      const upcomingSessions = sessions.filter(s => new Date(s.scheduledAt) > new Date());
      const completedSessions = sessions.filter(s => s.status === "completed");
      
      const feedbackList = await Promise.all(
        completedSessions.map(s => getFeedbackForSession(s.id))
      );
      
      const averageRating = feedbackList.length > 0
        ? feedbackList.reduce((sum, f) => sum + (f?.[0]?.rating || 0), 0) / feedbackList.length
        : null;

      return {
        sessions,
        upcomingSessions,
        completedSessions,
        averageRating,
      };
    }),
});
```

### 2. Tutor Profile Router

```typescript
const tutorProfileRouter = router({
  update: tutorProcedure
    .input(z.object({
      bio: z.string().optional(),
      linkedin: z.string().optional(),
      tutorSubjects: z.string().optional(),
      tutorLevel: z.string().optional(),
      tutorUniversity: z.string().optional(),
      tutorCourse: z.string().optional(),
      profilePhotoUrl: z.string().optional(),
      bankAccountName: z.string().optional(),
      bankSortCode: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      bankPaypalEmail: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await updateTutorProfile(ctx.user.id, input);
    }),
});
```

### 3. Tutoring Router

```typescript
const tutoringRouter = router({
  myStudents: tutorProcedure.query(async ({ ctx }) => {
    const relationships = await getTutoringRelationshipsByTutorId(ctx.user.id);
    return relationships.filter(r => r.status === "active").map(r => r.student);
  }),

  myTutors: studentProcedure.query(async ({ ctx }) => {
    const relationships = await getTutoringRelationshipsByStudentId(ctx.user.id);
    return relationships.filter(r => r.status === "active");
  }),

  createRelationship: adminProcedure
    .input(z.object({ tutorId: z.number(), studentId: z.number() }))
    .mutation(async ({ input }) => {
      return await createTutoringRelationship({
        tutorId: input.tutorId,
        studentId: input.studentId,
        status: "active",
      });
    }),
});
```

### 4. Feedback Router

```typescript
const feedbackRouter = router({
  submit: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      toUserId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await createFeedback({
        sessionId: input.sessionId,
        fromUserId: ctx.user.id,
        toUserId: input.toUserId,
        rating: input.rating,
        comment: input.comment,
      });
    }),

  received: tutorProcedure.query(async ({ ctx }) => {
    return await getFeedbackReceivedByUser(ctx.user.id);
  }),

  forSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      return await getFeedbackForSession(input.sessionId);
    }),
});
```

### 5. Session Router (Complete)

Replace the duplicate definition with:

```typescript
const sessionRouter = router({
  studentSessions: studentProcedure.query(async ({ ctx }) => {
    return await getTutoringSessionsByStudentId(ctx.user.id);
  }),

  tutorSessions: tutorProcedure.query(async ({ ctx }) => {
    return await getTutoringSessionsByTutorId(ctx.user.id);
  }),

  updateStatus: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      status: z.enum(["scheduled", "completed", "cancelled"]),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [session] = await db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.id, input.sessionId));

      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      // Verify user is part of this session
      if (session.studentId !== ctx.user.id && session.tutorId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (input.status === "cancelled") {
        await sendSessionCancellationNotice({
          sessionId: input.sessionId,
          reason: input.reason,
        }).catch(e => console.error(e));
      }

      return await updateTutoringSessionStatus(input.sessionId, input.status);
    }),

  rescheduleSession: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      newDate: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [session] = await db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.id, input.sessionId));

      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      // Verify user is part of this session
      if (session.studentId !== ctx.user.id && session.tutorId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await updateTutoringSessionStatus(input.sessionId, "rescheduled");
    }),

  requestSession: protectedProcedure
    .input(z.object({
      tutorId: z.number(),
      studentId: z.number(),
      scheduledAt: z.date(),
      duration: z.union([z.literal(60), z.literal(90), z.literal(120)]),
      subject: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const cost = input.duration / 60;
      const balance = await getCreditBalance(input.studentId);

      if (balance < cost) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient credit balance." });
      }

      return await createTutoringSession({
        ...input,
        status: "pending_student",
      });
    }),

  acceptBooking: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [session] = await db
        .select()
        .from(tutoringSessions)
        .where(eq(tutoringSessions.id, input.sessionId));

      if (!session) throw new TRPCError({ code: "NOT_FOUND" });

      await db.transaction(async (tx) => {
        const cost = session.duration / 60;
        await updateCreditBalance(session.studentId, -cost);
        await updateTutoringSessionStatus(input.sessionId, "scheduled");
      });

      return { success: true };
    }),
});
```

### 6. Admin Router

```typescript
const adminRouter = router({
  getAllUsers: adminProcedure.query(async () => {
    return await getAllUsers();
  }),

  getUserProfile: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getUserById(input.id);
    }),

  updateUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["user", "tutor", "parent", "admin"]) }))
    .mutation(async ({ input }) => {
      return await updateUserRole(input.userId, input.role);
    }),

  approveTutor: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      return await approveTutorByEmail(input.email);
    }),
});
```

### 7. Auth Router

```typescript
const authRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // Clear session/cookie
    return { success: true };
  }),
});
```

### 8. Storage Router

```typescript
const storageRouter = router({
  upload: protectedProcedure
    .input(z.object({
      filename: z.string(),
      contentType: z.string(),
      base64: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.base64, "base64");
      const key = `users/${ctx.user.id}/${Date.now()}-${input.filename}`;
      
      const url = await storagePut({
        key,
        body: buffer,
        contentType: input.contentType,
      });

      return { url };
    }),
});
```

### 9. Contact Router

```typescript
const contactRouter = router({
  submit: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      subject: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      await createContactMessage(input);
      await sendContactConfirmation(input).catch(e => console.error(e));
      return { success: true };
    }),

  list: adminProcedure.query(async () => {
    return await getAllContactMessages();
  }),

  updateStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["new", "read", "resolved"]) }))
    .mutation(async ({ input }) => {
      return await updateContactStatus(input.id, input.status);
    }),
});
```

### 10. Tutor Router

```typescript
const tutorRouter = router({
  apply: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      subjects: z.string(),
      qualifications: z.string(),
      availability: z.string(),
    }))
    .mutation(async ({ input }) => {
      const application = await createTutorApplication(input);
      await sendTutorApplicationConfirmation(input).catch(e => console.error(e));
      return application;
    }),

  listApplications: adminProcedure.query(async () => {
    return await getAllTutorApplications();
  }),

  updateApplicationStatus: adminProcedure
    .input(z.object({ id: z.number(), status: z.enum(["pending", "approved", "rejected"]) }))
    .mutation(async ({ input }) => {
      return await updateTutorApplicationStatus(input.id, input.status);
    }),
});
```

### 11. Payments Router

```typescript
const paymentsRouter = router({
  createCheckoutSession: protectedProcedure
    .input(z.object({
      productId: z.string(),
      quantity: z.number().default(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const customer = await getOrCreateStripeCustomer(ctx.user.email);
      const product = PRODUCTS[input.productId as keyof typeof PRODUCTS];
      
      if (!product) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: { name: product.name },
              unit_amount: product.price * 100,
            },
            quantity: input.quantity,
          },
        ],
        mode: "payment",
        success_url: `${process.env.PUBLIC_URL}/success`,
        cancel_url: `${process.env.PUBLIC_URL}/cancel`,
      });

      return { url: session.url };
    }),

  getOrders: protectedProcedure.query(async ({ ctx }) => {
    return await getOrdersByUserId(ctx.user.id);
  }),
});
```

### 12. Banners Router

```typescript
const bannersRouter = router({
  list: publicProcedure.query(async () => {
    return await getAllBanners();
  }),

  active: publicProcedure.query(async () => {
    return await getActiveBanner();
  }),

  create: adminProcedure
    .input(z.object({
      title: z.string(),
      message: z.string(),
      type: z.enum(["info", "warning", "success"]),
    }))
    .mutation(async ({ input }) => {
      return await createBanner(input);
    }),

  setActive: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await setBannerActive(input.id);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteBanner(input.id);
    }),
});
```

### 13. Push Router

```typescript
const pushRouter = router({
  subscribe: publicProcedure
    .input(z.object({
      subscription: z.object({
        endpoint: z.string(),
        keys: z.object({
          p256dh: z.string(),
          auth: z.string(),
        }),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      return await savePushSubscription(ctx.user?.id, input.subscription);
    }),

  unsubscribe: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ input }) => {
      return await deletePushSubscription(input.endpoint);
    }),

  publicKey: publicProcedure.query(async () => {
    return { key: await getVapidPublicKey() };
  }),

  sendAll: adminProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await sendPushToAll(input);
    }),
});
```

### 14. Account Router

```typescript
const accountRouter = router({
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await updateUserProfile(ctx.user.id, input);
    }),

  updateAccountType: protectedProcedure
    .input(z.object({ accountType: z.enum(["student", "tutor", "parent"]) }))
    .mutation(async ({ input, ctx }) => {
      return await updateAccountType(ctx.user.id, input.accountType);
    }),
});
```

### 15. Referral Router

```typescript
const referralRouter = router({
  myCode: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    return { code: user?.referralCode };
  }),

  getPendingRewards: protectedProcedure.query(async ({ ctx }) => {
    return await getPendingRewardsForUser(ctx.user.id);
  }),

  createReferral: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const referrer = await getUserByReferralCode(input.code);
      if (!referrer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid referral code" });
      }

      return await createReferral({
        referrerId: referrer.id,
        referredUserId: ctx.user?.id,
        code: input.code,
      });
    }),
});
```

---

## Integration Steps

1. Copy all router definitions into `server/routers.ts` before the `appRouter` export
2. Remove the duplicate `sessionRouter` definition (lines 189–231)
3. Update the `appRouter` export to include all routers
4. Add `storageRouter` to the imports and `appRouter`
5. Test compilation: `npm run build`
6. Run tests to verify all procedures work correctly

---

## Notes

- All routers use proper role-based guards (`adminProcedure`, `tutorProcedure`, etc.)
- Input validation is performed using Zod schemas
- Error handling follows tRPC conventions
- Database functions are imported from `./db`
- Email functions are imported from `./email`
- Storage functions are imported from `./storage`

---

**Last Updated:** 2026-06-26
