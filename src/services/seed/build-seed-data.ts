import type {
  Appointment,
  AuthUser,
  EducationalResource,
  JourneyStage,
  Medication,
  MedicationHistoryEntry,
  Notification,
  Patient,
  Profile,
  Treatment,
} from '@/types'
import { daysFromNow, toIsoDate } from '@/utils/date'

/**
 * Builds the entire fictional dataset the demo runs on, anchored to a
 * reference "now" so upcoming appointments and next doses always look
 * current when the app is opened — and so tests can pass a fixed date
 * for deterministic fixtures instead of depending on the real clock.
 *
 * Every name, provider, clinic, and identifier here is invented for this
 * portfolio project. None of it represents a real person, real company,
 * or real patient record.
 */
export function buildSeedData(now: Date = new Date()) {
  const isoDate = (days: number) => toIsoDate(daysFromNow(now, days))
  const atTime = (days: number, hour: number, minute = 0) => {
    const d = daysFromNow(now, days)
    d.setHours(hour, minute, 0, 0)
    return d.toISOString()
  }

  const patient: Patient = {
    id: 'pat_001',
    firstName: 'Jordan',
    lastName: 'Ellis',
    preferredLanguage: 'en',
    avatarInitials: 'JE',
    memberSince: isoDate(-400),
    condition: 'Moderate-to-severe atopic dermatitis',
  }

  const treatment: Treatment = {
    id: 'trt_001',
    name: 'Solvitra (etravolimab)',
    conditionLabel: patient.condition,
    status: 'active',
    startDate: isoDate(-350),
    prescribingProvider: 'Dr. Amara Whitfield, Dermatology',
    summary:
      'A maintenance biologic taken by injection every two weeks, prescribed after an initial course of topical treatment.',
  }

  const journeyStages: JourneyStage[] = [
    {
      id: 'stage_diagnosis',
      type: 'diagnosis',
      status: 'completed',
      title: 'Diagnosis confirmed',
      description:
        'Dr. Whitfield confirmed a diagnosis of moderate-to-severe atopic dermatitis during your dermatology consultation.',
      date: isoDate(-380),
    },
    {
      id: 'stage_prescribed',
      type: 'prescribed',
      status: 'completed',
      title: 'Solvitra prescribed',
      description:
        'Your care team prescribed Solvitra (etravolimab) and reviewed what to expect from treatment.',
      date: isoDate(-365),
    },
    {
      id: 'stage_onboarding',
      type: 'onboarding',
      status: 'completed',
      title: 'Onboarding complete',
      description:
        'You completed an onboarding call with a Meridian Care nurse and administered your first dose.',
      date: isoDate(-350),
    },
    {
      id: 'stage_current',
      type: 'current',
      status: 'current',
      title: 'Maintenance dosing',
      description:
        "You're in the maintenance phase, taking Solvitra every two weeks and tracking how you're doing.",
      date: isoDate(-300),
    },
    {
      id: 'stage_follow_up',
      type: 'follow_up',
      status: 'upcoming',
      title: 'Quarterly follow-up',
      description:
        'An in-depth visit with Dr. Whitfield to review your progress and adjust your plan if needed.',
      date: isoDate(41),
    },
    {
      id: 'stage_long_term',
      type: 'long_term',
      status: 'upcoming',
      title: 'Long-term management',
      description:
        'Ongoing monitoring and support to help you maintain your results over time.',
      date: null,
    },
  ]

  const clinic = {
    kind: 'in_person' as const,
    name: 'Meridian Dermatology Clinic',
    address: '4 Concourse Way, Suite 220, Denver, CO 80202',
  }
  const lab = {
    kind: 'in_person' as const,
    name: 'Meridian Diagnostics Lab',
    address: '4 Concourse Way, Suite 110, Denver, CO 80202',
  }
  const telehealth = {
    kind: 'telehealth' as const,
    name: 'Meridian Care video visit',
    address: null,
  }

  const drWhitfield = { name: 'Dr. Amara Whitfield', specialty: 'Dermatology' }
  const nursePriya = { name: 'Priya Nandakumar, RN', specialty: 'Care Coordination' }
  const labTeam = {
    name: 'Meridian Diagnostics Lab Team',
    specialty: 'Laboratory Services',
  }

  const appointments: Appointment[] = [
    {
      id: 'appt_001',
      type: 'physician_visit',
      status: 'completed',
      scheduledAt: atTime(-380, 10, 0),
      durationMinutes: 45,
      provider: drWhitfield,
      location: clinic,
      notes: 'Initial consultation and diagnosis review.',
    },
    {
      id: 'appt_002',
      type: 'onboarding_call',
      status: 'completed',
      scheduledAt: atTime(-350, 13, 30),
      durationMinutes: 30,
      provider: nursePriya,
      location: telehealth,
      notes: 'Walked through injection technique and set up dose reminders.',
    },
    {
      id: 'appt_003',
      type: 'nurse_check_in',
      status: 'completed',
      scheduledAt: atTime(-120, 9, 15),
      durationMinutes: 20,
      provider: nursePriya,
      location: telehealth,
      notes: 'Reviewed adherence and skin response — no concerns.',
    },
    {
      id: 'appt_004',
      type: 'nurse_check_in',
      status: 'cancelled',
      scheduledAt: atTime(6, 9, 0),
      durationMinutes: 20,
      provider: nursePriya,
      location: telehealth,
      notes: 'Cancelled by patient. Use "Reschedule" to pick a new time.',
    },
    {
      id: 'appt_005',
      type: 'lab_work',
      status: 'upcoming',
      scheduledAt: atTime(9, 8, 30),
      durationMinutes: 15,
      provider: labTeam,
      location: lab,
      notes: 'Routine lab panel — no fasting required.',
    },
    {
      id: 'appt_006',
      type: 'physician_visit',
      status: 'upcoming',
      scheduledAt: atTime(41, 11, 0),
      durationMinutes: 45,
      provider: drWhitfield,
      location: clinic,
      notes: null,
    },
  ]

  // Biweekly adherence log from treatment start through "today".
  const adherence: Medication['adherence'] = []
  for (let offset = -350; offset <= 0; offset += 14) {
    adherence.push({
      date: isoDate(offset),
      // One realistic missed dose in the middle of the course.
      taken: offset !== -168,
    })
  }

  const medication: Medication = {
    id: 'med_001',
    name: 'Solvitra',
    form: 'Prefilled auto-injector pen',
    dosage: '200 mg',
    frequencyLabel: 'Every 2 weeks',
    routeOfAdministration: 'Subcutaneous injection',
    startDate: isoDate(-350),
    nextDoseAt: atTime(4, 9, 0),
    instructions:
      'Let the pen reach room temperature for about 30 minutes before injecting. Rotate injection sites between your thigh and abdomen, and avoid areas that are tender, bruised, or affected by your condition.',
    adherence,
  }

  const medicationHistory: MedicationHistoryEntry[] = [
    {
      id: 'medh_001',
      name: 'Topical corticosteroid (Dermacort 0.1%)',
      dosage: 'Applied twice daily',
      startDate: isoDate(-520),
      endDate: isoDate(-365),
      outcome: 'switched',
      note: 'Moved to Solvitra after limited response to topical treatment alone.',
    },
  ]

  const resources: EducationalResource[] = [
    {
      id: 'res_001',
      title: 'How Solvitra Works',
      category: 'treatment_basics',
      summary:
        'A plain-language look at what a biologic maintenance therapy does and why dosing is spaced every two weeks.',
      body: [
        'Solvitra is a maintenance biologic, which means it works differently from short courses of treatment you may have tried before. Instead of a single fix, it is designed to be taken on a steady schedule.',
        'Most patients settle into a routine within the first few cycles. Your care team will check in regularly during this period to see how you are responding.',
        'This page is educational only. Always follow the specific instructions your prescriber gives you, and bring any questions to your next appointment.',
      ],
      tags: ['biologic', 'getting started'],
      readTimeMinutes: 4,
      publishedAt: isoDate(-340),
    },
    {
      id: 'res_002',
      title: 'Understanding Your Injection Schedule',
      category: 'treatment_basics',
      summary:
        'What "every two weeks" means in practice, and how reminders keep you on track.',
      body: [
        'Your medication schedule is built around a consistent two-week cadence. Keeping doses evenly spaced — rather than close together or far apart — is part of staying consistent with your plan.',
        'The Medications page shows your next scheduled dose and lets you review your history at a glance.',
      ],
      tags: ['scheduling', 'adherence'],
      readTimeMinutes: 3,
      publishedAt: isoDate(-330),
    },
    {
      id: 'res_003',
      title: 'Preparing for Your First Dose',
      category: 'treatment_basics',
      summary: 'A checklist for a calm, confident first injection.',
      body: [
        'Set aside a quiet ten minutes, wash your hands, and let your pen warm to room temperature first.',
        'Have your sharps container within reach, and pick a rotation site you have not used in the last two doses.',
        'If anything feels unclear in the moment, your care team is a message away.',
      ],
      tags: ['getting started', 'injection'],
      readTimeMinutes: 3,
      publishedAt: isoDate(-355),
    },
    {
      id: 'res_004',
      title: 'Everyday Skin Care Habits That Help',
      category: 'living_with_a_condition',
      summary:
        'Small daily habits many patients find useful alongside their treatment plan.',
      body: [
        'Gentle, fragrance-free cleansers and consistent moisturizing routines are commonly recommended alongside treatment.',
        'Tracking flare patterns — like after certain fabrics, weather, or stress — can be useful information to bring to your appointments.',
        'This is general lifestyle information, not a substitute for guidance from your care team.',
      ],
      tags: ['daily habits', 'skin care'],
      readTimeMinutes: 5,
      publishedAt: isoDate(-200),
    },
    {
      id: 'res_005',
      title: 'Talking to Family and Friends About Your Condition',
      category: 'living_with_a_condition',
      summary:
        'Conversation starters for explaining a chronic condition to the people around you.',
      body: [
        'You do not owe anyone a detailed explanation, but a short, clear description can cut down on repeated questions.',
        'Consider preparing one or two sentences you feel comfortable reusing across different conversations.',
      ],
      tags: ['relationships', 'communication'],
      readTimeMinutes: 4,
      publishedAt: isoDate(-150),
    },
    {
      id: 'res_006',
      title: 'Getting the Most From Your Care Team Visits',
      category: 'appointments',
      summary:
        'How to prepare questions and notes so your appointment time goes further.',
      body: [
        'Jot down questions as they come up during the weeks between visits, rather than trying to remember them all at once.',
        'Bring your adherence history — the Medications page can help you review it before you go.',
      ],
      tags: ['appointments', 'preparation'],
      readTimeMinutes: 3,
      publishedAt: isoDate(-90),
    },
    {
      id: 'res_007',
      title: 'What to Expect at a Telehealth Check-In',
      category: 'appointments',
      summary:
        'A quick walkthrough of how video visits with your nurse coordinator work.',
      body: [
        'Telehealth check-ins are typically shorter than in-person visits and focus on how you are tolerating treatment.',
        'Test your camera and microphone a few minutes early, and have your medication schedule handy.',
      ],
      tags: ['telehealth', 'appointments'],
      readTimeMinutes: 2,
      publishedAt: isoDate(-60),
    },
    {
      id: 'res_008',
      title: 'Building a Routine That Supports Your Treatment',
      category: 'nutrition_and_lifestyle',
      summary: 'Pairing your dosing schedule with habits that are easy to sustain.',
      body: [
        'Many patients anchor their injection day to an existing routine — like a specific day of the week — to make it easier to remember.',
        'Keeping a consistent sleep schedule and staying hydrated are commonly cited as helpful general habits.',
      ],
      tags: ['routine', 'lifestyle'],
      readTimeMinutes: 4,
      publishedAt: isoDate(-110),
    },
    {
      id: 'res_009',
      title: 'Sleep and Stress: Small Changes, Real Impact',
      category: 'nutrition_and_lifestyle',
      summary: 'General wellness habits patients often find worth trying.',
      body: [
        'Stress and sleep quality are frequently mentioned by patients as factors worth paying attention to.',
        'Small, sustainable changes — a wind-down routine, consistent bedtimes — tend to stick better than big overhauls.',
      ],
      tags: ['sleep', 'stress'],
      readTimeMinutes: 4,
      publishedAt: isoDate(-70),
    },
    {
      id: 'res_010',
      title: 'Finding a Support Group Near You',
      category: 'support_and_community',
      summary:
        'How to find in-person and online communities of people managing similar conditions.',
      body: [
        'Many patients find it helpful to connect with others who understand the day-to-day experience of a chronic condition.',
        'Ask your care coordinator about local groups, or look for moderated online communities focused on your condition.',
      ],
      tags: ['community', 'support'],
      readTimeMinutes: 3,
      publishedAt: isoDate(-40),
    },
    {
      id: 'res_011',
      title: 'Meridian Care Patient Community Guidelines',
      category: 'support_and_community',
      summary:
        'What to expect from the Meridian Care patient community, and how it stays supportive.',
      body: [
        'Our community spaces are moderated and are not a substitute for medical advice.',
        'Members are asked to keep discussions respectful and to bring clinical questions to their own care team rather than other patients.',
      ],
      tags: ['community', 'guidelines'],
      readTimeMinutes: 2,
      publishedAt: isoDate(-30),
    },
  ]

  const notifications: Notification[] = [
    {
      id: 'notif_001',
      category: 'medication',
      title: 'Dose reminder',
      message: 'Your next Solvitra dose is coming up in 4 days.',
      createdAt: atTime(-1, 9, 0),
      read: false,
    },
    {
      id: 'notif_002',
      category: 'appointment',
      title: 'Lab work scheduled',
      message:
        'Routine lab panel confirmed for ' + isoDate(9) + ' at Meridian Diagnostics Lab.',
      createdAt: atTime(-2, 14, 0),
      read: false,
    },
    {
      id: 'notif_003',
      category: 'appointment',
      title: 'Check-in cancelled',
      message:
        'Your nurse check-in was cancelled. Reschedule from the Appointments page when ready.',
      createdAt: atTime(-1, 16, 45),
      read: false,
    },
    {
      id: 'notif_004',
      category: 'medication',
      title: 'Missed dose logged',
      message:
        'We noticed a gap in your adherence history. No action needed — just flagging it for your next visit.',
      createdAt: atTime(-30, 9, 0),
      read: true,
    },
    {
      id: 'notif_005',
      category: 'resource',
      title: 'New resource available',
      message:
        '"Getting the Most From Your Care Team Visits" was just added to your resource library.',
      createdAt: atTime(-6, 10, 0),
      read: true,
    },
    {
      id: 'notif_006',
      category: 'appointment',
      title: 'Quarterly follow-up scheduled',
      message: 'Your visit with Dr. Whitfield is confirmed for ' + isoDate(41) + '.',
      createdAt: atTime(-14, 11, 0),
      read: true,
    },
    {
      id: 'notif_007',
      category: 'system',
      title: 'Preferences updated',
      message: 'Your notification preferences were saved successfully.',
      createdAt: atTime(-20, 17, 30),
      read: true,
    },
    {
      id: 'notif_008',
      category: 'system',
      title: 'Welcome to Meridian Care',
      message:
        'Your patient portal is ready. Explore your dashboard to see your treatment journey.',
      createdAt: isoDate(-350),
      read: true,
    },
  ]

  const profile: Profile = {
    id: 'pat_001',
    firstName: 'Jordan',
    lastName: 'Ellis',
    email: 'jordan.ellis@meridiancare.demo',
    phone: '+1 (555) 019-4482',
    preferredLanguage: 'en',
    timezone: 'America/Denver',
    notificationPreferences: {
      appointmentReminders: { email: true, sms: true, push: false },
      medicationReminders: { email: true, sms: false, push: true },
      educationalContent: { email: false, sms: false, push: false },
    },
  }

  const authUser: AuthUser = {
    id: 'user_001',
    name: 'Jordan Ellis',
    email: 'jordan.ellis@meridiancare.demo',
  }

  /** Demo-only credentials, shown on the login screen. See README > Security. */
  const demoCredentials = {
    email: 'jordan.ellis@meridiancare.demo',
    password: 'MeridianDemo123!',
  }

  return {
    patient,
    treatment,
    journeyStages,
    appointments,
    medication,
    medicationHistory,
    resources,
    notifications,
    profile,
    authUser,
    demoCredentials,
  }
}

export type SeedData = ReturnType<typeof buildSeedData>
