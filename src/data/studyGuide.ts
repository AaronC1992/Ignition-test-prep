export type StudyGuideLink = {
  label: string
  url: string
}

export type StudyGuideMeta = {
  handsOnPriority: string
  watchFor: string[]
  relatedLabIds: string[]
  relatedScenarioIds: string[]
  references: StudyGuideLink[]
}

export const coreResources: StudyGuideLink[] = [
  { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
  { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
  { label: 'Recommended resources', url: 'https://training.inductiveautomation.com/core-certification/study-guide/recommended-resources' },
  { label: 'Ignition training home', url: 'https://training.inductiveautomation.com/' },
]

export const studyLoop = [
  'Read one lesson and repeat the exam reminders out loud before marking it complete.',
  'Run the matching quiz immediately after the lesson, then review only the missed lesson IDs.',
  'Flip through the related flashcards until you can define each term without reading the answer.',
  'Finish the matching lab or at least walk through the checklist in your own Gateway sandbox.',
  'Use the troubleshooting drills to prove you can diagnose the topic under pressure.',
]

export const examDayChecklist = [
  'Keep the Ignition User Manual and Inductive University open in separate tabs before the exam starts.',
  'Use the app for active recall first, then open the manual only when you need confirmation.',
  'When a question mentions a scope, stop and identify Gateway, project, client, or session before answering.',
  'When a question involves alarms, security, bindings, or history, check the exact configuration layer being tested.',
  'Save time by skipping long lookups until you have answered every question you can from memory.',
]

export const studyGuideMetaByLessonId: Record<string, StudyGuideMeta> = {
  architecture: {
    handsOnPriority: 'Be able to explain where Gateway, Designer, Vision, and Perspective each run without hesitating.',
    watchFor: ['Confusing client scope with session scope', 'Treating the Designer as a runtime host instead of the editing tool'],
    relatedLabIds: ['lab-1', 'lab-4'],
    relatedScenarioIds: ['ts-16', 'ts-35', 'ts-40'],
    references: [
      { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  installation: {
    handsOnPriority: 'Practice navigating the Gateway webpage until you can find module status, backups, and activation quickly.',
    watchFor: ['Mixing Gateway administration tasks with Designer tasks', 'Assuming a project export is the same as a full Gateway backup'],
    relatedLabIds: ['lab-1'],
    relatedScenarioIds: ['ts-1', 'ts-41', 'ts-48'],
    references: [
      { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
      { label: 'Recommended resources', url: 'https://training.inductiveautomation.com/core-certification/study-guide/recommended-resources' },
    ],
  },
  'plc-database': {
    handsOnPriority: 'Practice telling whether a value belongs in an OPC path, a tag, or a database query before you build anything.',
    watchFor: ['Treating live device data and database data as the same source type', 'Skipping connection diagnostics before troubleshooting values'],
    relatedLabIds: ['lab-1', 'lab-5'],
    relatedScenarioIds: ['ts-1', 'ts-2', 'ts-33', 'ts-41'],
    references: [
      { label: 'Types of Tags', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/tags/types-of-tags' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  'designer-projects': {
    handsOnPriority: 'Use the Designer until opening resources, previewing, saving, and publishing feels automatic.',
    watchFor: ['Previewing and forgetting to publish', 'Searching the wrong browser panel for tags or resources'],
    relatedLabIds: ['lab-1', 'lab-2'],
    relatedScenarioIds: ['ts-34', 'ts-40'],
    references: [
      { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  vision: {
    handsOnPriority: 'Build at least one main window, one popup, and a simple navigation path in Vision.',
    watchFor: ['Choosing the wrong window type', 'Testing only in preview and not validating runtime behavior'],
    relatedLabIds: ['lab-1', 'lab-3', 'lab-5'],
    relatedScenarioIds: ['ts-12', 'ts-17', 'ts-25', 'ts-40'],
    references: [
      { label: 'Vision overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/vision' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  bindings: {
    handsOnPriority: 'Practice matching each component to the right binding type before you bind the property.',
    watchFor: ['Using one way binding where writeback is required', 'Breaking indirect bindings with a bad parameter path'],
    relatedLabIds: ['lab-1', 'lab-2', 'lab-4'],
    relatedScenarioIds: ['ts-4', 'ts-5', 'ts-17', 'ts-23', 'ts-26'],
    references: [
      { label: 'Vision overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/vision' },
      { label: 'Perspective overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective' },
    ],
  },
  tags: {
    handsOnPriority: 'Know which tag type to choose and why before you create tags in the browser.',
    watchFor: ['Using memory tags for values that should come from devices', 'Ignoring quality and group assignment when values look wrong'],
    relatedLabIds: ['lab-1', 'lab-3'],
    relatedScenarioIds: ['ts-2', 'ts-3', 'ts-27', 'ts-31', 'ts-32'],
    references: [
      { label: 'Types of Tags', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/tags/types-of-tags' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  udts: {
    handsOnPriority: 'Build one solid UDT definition with parameters, then prove you can create and validate multiple instances.',
    watchFor: ['Hard coding device paths inside the definition', 'Missing overrides that block inheritance'],
    relatedLabIds: ['lab-2', 'lab-3'],
    relatedScenarioIds: ['ts-7', 'ts-19'],
    references: [
      { label: 'User Defined Types', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/tags/user-defined-types-udts' },
      { label: 'Types of Tags', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/tags/types-of-tags' },
    ],
  },
  templates: {
    handsOnPriority: 'Practice one template parameter flow from instance to label, writeback control, and indirect path.',
    watchFor: ['Leaving a fixed conveyor path inside the template', 'Forgetting to pass the instance parameter'],
    relatedLabIds: ['lab-2', 'lab-3'],
    relatedScenarioIds: ['ts-6', 'ts-18', 'ts-39'],
    references: [
      { label: 'Vision overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/vision' },
      { label: 'User Defined Types', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/tags/user-defined-types-udts' },
    ],
  },
  history: {
    handsOnPriority: 'Enable history on a few tags and verify you can chart the stored data by time range.',
    watchFor: ['Expecting historical queries without enabling collection first', 'Using the wrong provider or sampling behavior'],
    relatedLabIds: ['lab-3', 'lab-5'],
    relatedScenarioIds: ['ts-11', 'ts-28', 'ts-49'],
    references: [
      { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
      { label: 'Reporting overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/reporting' },
    ],
  },
  'transaction-groups': {
    handsOnPriority: 'Be able to explain when a transaction group is better than a simple tag binding or script write.',
    watchFor: ['Ignoring triggers and update timing', 'Forgetting why store and forward matters'],
    relatedLabIds: ['lab-5'],
    relatedScenarioIds: ['ts-33', 'ts-48'],
    references: [
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
      { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
    ],
  },
  security: {
    handsOnPriority: 'Practice the difference between visible, enabled, and writable so you can secure the right layer.',
    watchFor: ['Hiding controls when the real requirement is to block edits', 'Forgetting that Gateway and project security are different scopes'],
    relatedLabIds: ['lab-3', 'lab-4'],
    relatedScenarioIds: ['ts-4', 'ts-15', 'ts-36', 'ts-42'],
    references: [
      { label: 'Perspective overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective' },
      { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
    ],
  },
  alarming: {
    handsOnPriority: 'Create alarms that you can force Active, Acknowledged, and Cleared on demand during practice.',
    watchFor: ['Using the wrong alarm mode or setpoint', 'Assuming acknowledgment clears the alarm condition'],
    relatedLabIds: ['lab-3'],
    relatedScenarioIds: ['ts-20', 'ts-21', 'ts-22'],
    references: [
      { label: 'Alarming overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/alarming' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  'alarm-history': {
    handsOnPriority: 'Practice the difference between live alarm status and journaled alarm history using the same event.',
    watchFor: ['Looking only at active alarms', 'Filtering the journal too broadly or against the wrong path'],
    relatedLabIds: ['lab-3'],
    relatedScenarioIds: ['ts-21', 'ts-44'],
    references: [
      { label: 'Alarming overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/alarming' },
      { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
    ],
  },
  notification: {
    handsOnPriority: 'Be able to explain rosters, profiles, delays, escalation, and dropout logic as one flow.',
    watchFor: ['Missing contact information or schedules', 'Forgetting the clear state exit path in a pipeline'],
    relatedLabIds: ['lab-3'],
    relatedScenarioIds: ['ts-37', 'ts-38'],
    references: [
      { label: 'Alarming overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/alarming' },
      { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
    ],
  },
  popups: {
    handsOnPriority: 'Open the same popup for different conveyors and prove every label, filter, and chart follows the parameter.',
    watchFor: ['Passing the wrong parameter from the template or button', 'Using broad filters that match multiple assets'],
    relatedLabIds: ['lab-3'],
    relatedScenarioIds: ['ts-8', 'ts-9', 'ts-10', 'ts-25'],
    references: [
      { label: 'Vision overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/vision' },
      { label: 'Alarming overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/alarming' },
    ],
  },
  scripting: {
    handsOnPriority: 'Practice deciding the script scope before you write the first line of Jython.',
    watchFor: ['Calling client only functions in Gateway scope', 'Confusing component values, tags, and datasets inside a script'],
    relatedLabIds: ['lab-3', 'lab-4'],
    relatedScenarioIds: ['ts-16', 'ts-34', 'ts-43'],
    references: [
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
      { label: 'Ignition User Manual', url: 'https://docs.inductiveautomation.com/' },
    ],
  },
  perspective: {
    handsOnPriority: 'Build one reusable view, one page route, and one embedded view pattern that you can explain from memory.',
    watchFor: ['Confusing page configuration with view configuration', 'Forgetting to pass embedded parameters or check the property tree'],
    relatedLabIds: ['lab-4'],
    relatedScenarioIds: ['ts-13', 'ts-14', 'ts-23', 'ts-24', 'ts-35', 'ts-47', 'ts-50'],
    references: [
      { label: 'Perspective overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  reporting: {
    handsOnPriority: 'Build one report end to end, from data source to viewer, and verify the date parameters change the output.',
    watchFor: ['Using the wrong data key in the table or chart', 'Leaving the report viewer disconnected from the chosen date range'],
    relatedLabIds: ['lab-5'],
    relatedScenarioIds: ['ts-12', 'ts-29', 'ts-30', 'ts-46'],
    references: [
      { label: 'Reporting overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/reporting' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
}