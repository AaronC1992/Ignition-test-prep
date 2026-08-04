export type LabStep = {
  id: string
  instruction: string
  hint: string
}

export type LabResource = {
  label: string
  url: string
}

export type LabTheme = {
  id: string
  title: string
  summary: string
  instructions: string
  preparation: string[]
  deliverables: string[]
  failurePoints: string[]
  steps: LabStep[]
  rubric: string[]
  resources: LabResource[]
}

export const labs: LabTheme[] = [
  {
    id: 'lab-1',
    title: 'Lab 1: Device, Tag Groups, Tags, and Vision',
    summary: 'Create the simulator connection, build the tag group, load tags, and place Vision controls for two conveyors.',
    instructions: 'Build this lab as a self contained starter project. If you have a tag import file, use it. If not, create one conveyor folder by hand and duplicate the pattern until you have 15 conveyors.',
    preparation: [
      'Confirm the Vision module is installed and the Designer can open the active project.',
      'Use a browsable device connection, ideally the built in Programmable Device Simulator, so you can create OPC tags from the OPC Browser.',
      'If no import file is available, create a minimal conveyor model with tags such as HOA, Speed, SpeedSP, Amps, and Faulted so the rest of the labs have something to bind to.',
    ],
    deliverables: [
      'Programmable Device Simulator named LabWorkSim',
      'Tag Group named LabWorkRate at a constant 2 second rate',
      'LabWorkSim folder with 15 Conveyor folders',
      'Vision window Lab work day 1 with two conveyor displays',
    ],
    failurePoints: [
      'Using the wrong folder name for the imported tags',
      'Forgetting to set the Conveyor tags to LabWorkRate',
      'Binding a Multi state Button to the wrong HOA tag',
    ],
    steps: [
      { id: 'l1-1', instruction: 'Create a device connection named LabWorkSim from the Gateway. Confirm the connection is fault free before creating any tags.', hint: 'Ignition OPC tags rely on a valid OPC server and item path. If browsing is available, use the OPC Browser instead of typing paths manually.' },
      { id: 'l1-2', instruction: 'Create a constant tag group named LabWorkRate with a 2000 millisecond rate, then assign the live conveyor tags to that group.', hint: 'Keep the scan class simple at first. The goal is predictable updates, not advanced leased or driven behavior.' },
      { id: 'l1-3', instruction: 'Build a LabWorkSim folder with 15 Conveyor subfolders. Each folder should expose a consistent tag set for status, command, and feedback.', hint: 'If you are building tags manually, use OPC tags for live simulator values and memory tags for writable setpoints such as SpeedSP.' },
      { id: 'l1-4', instruction: 'Create a Vision main window named Lab work day 1 that shows two conveyor summaries with a label, a symbol or image, numeric feedback, and an HOA control.', hint: 'A Multi State Button or similar control can drive HOA, while labels and numeric displays should bind to the selected conveyor tags.' },
    ],
    rubric: ['Device connection created', 'Tag group at 2 second rate', 'Two conveyor display sets added', 'HOA value can be changed'],
    resources: [
      { label: 'Ignition tags overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/tags/types-of-tags' },
      { label: 'Vision module overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/vision' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  {
    id: 'lab-2',
    title: 'Lab 2: UDTs and Vision Templates',
    summary: 'Create the Conveyor UDT, make instances, build the template, and place four conveyor instances on the day 2 window.',
    instructions: 'Turn the repeated conveyor tag structure from Lab 1 into a reusable UDT, then pair it with a Vision template so one display can represent many conveyors.',
    preparation: [
      'Finish Lab 1 or create at least one complete conveyor tag folder that can serve as the model for the UDT.',
      'Decide which values are live device values and which should remain writable memory tags before you parameterize the UDT.',
      'Pick one template parameter naming scheme and use it consistently in both the UDT and the Vision template.',
    ],
    deliverables: [
      'Conveyor UDT with ConveyorNumber parameter',
      'ConveyorInstances folder with 15 instances',
      'Conveyor Template with indirect bindings',
      'Lab work day 2 window with four template instances',
    ],
    failurePoints: [
      'Leaving the OPC Item Path fixed instead of parameterized',
      'Mapping the wrong instance numbers to the template',
      'Forgetting the SpeedSP memory tag in the UDT',
    ],
    steps: [
      { id: 'l2-1', instruction: 'Create a Conveyor UDT definition from an existing folder or from scratch. Add a ConveyorNumber parameter and use that parameter anywhere the item path changes by conveyor.', hint: 'The official UDT guidance recommends parameterized definitions so one type can create many instances without repeating manual edits.' },
      { id: 'l2-2', instruction: 'Create 15 instances under a ConveyorInstances folder. Use the Multi Instance Wizard if available so the numbering and naming stay consistent.', hint: 'Instance names like Conveyor1 through Conveyor15 are easier to troubleshoot than mixed naming patterns.' },
      { id: 'l2-3', instruction: 'Build a Vision template that accepts a conveyor parameter and uses indirect tag bindings for the label, HOA control, Speed, SpeedSP, Amps, and Faulted state.', hint: 'Keep the template generic. If any binding contains a hard coded conveyor number, the template is not reusable yet.' },
      { id: 'l2-4', instruction: 'Create a Vision window named Lab work day 2 and place four template instances for conveyors 1, 6, 10, and 15.', hint: 'Test at least one writable field and one read only display in each instance so you know both the parameter and the bindings are correct.' },
    ],
    rubric: ['UDT instances created', 'Template binds correctly', 'Four template instances visible', 'HOA writes correctly'],
    resources: [
      { label: 'User Defined Types', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/tags/user-defined-types-udts' },
      { label: 'Vision module overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/vision' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  {
    id: 'lab-3',
    title: 'Lab 3: History, Alarms, Security, Popups, and Charts',
    summary: 'Enable history, add alarms, secure the popup field, and open the popup from the template.',
    instructions: 'Extend the reusable conveyor model with time based data, alarms, and a focused popup workflow. This lab replaces the missing worksheet with a practical alarm and history drill you can build from the public manual.',
    preparation: [
      'Use a working database connection before you enable history or journal style features.',
      'Choose one exact display path pattern for alarms, such as Area 1/Conveyor 01, so filtering does not match the wrong conveyor.',
      'Decide which roles may edit SpeedSP in the popup before you configure the writable component.',
    ],
    deliverables: [
      'Historized Conveyor UDT tags',
      'Faulted and High Speed alarms',
      'Lab work day 3 popup with parameter passing',
      'Alarm Status Table and Easy Chart filtered to the active conveyor',
    ],
    failurePoints: [
      'Using a loose filter that catches Conveyor 10 through 15',
      'Leaving the numeric field writable for every user',
      'Binding the chart to a fixed conveyor instead of the popup parameter',
    ],
    steps: [
      { id: 'l3-1', instruction: 'Enable history on the key conveyor values, at minimum Speed and SpeedSP, and store them in your active database backed history provider.', hint: 'Use the same storage target consistently so the Easy Chart has data to query later.' },
      { id: 'l3-2', instruction: 'Configure at least two alarms on the conveyor model. A common pattern is Faulted using Equal mode on a fault or HOA state, plus High Speed using an above setpoint rule tied to the speed value.', hint: 'Alarm events are Gateway scoped, so verify the alarm becomes Active, then Cleared, and can be acknowledged from a client component.' },
      { id: 'l3-3', instruction: 'Create a popup window named Lab work day 3 that accepts the selected conveyor as a parameter and shows a writable numeric field, an Alarm Status Table, and an Easy Chart.', hint: 'Use exact display path or source path filtering so Conveyor 1 does not also match Conveyor 10 or 11.' },
      { id: 'l3-4', instruction: 'Launch the popup from the template or main window and pass the selected conveyor number into every indirect binding and filter in the popup.', hint: 'The test is simple: open two different conveyors and verify the title, writable field, alarms, and chart all switch together.' },
    ],
    rubric: ['History enabled', 'Alarms configured', 'Security applied to edit control', 'Popup opens for different conveyors'],
    resources: [
      { label: 'Alarming overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/platform/alarming' },
      { label: 'Vision module overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/vision' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
  {
    id: 'lab-4',
    title: 'Lab 4: Perspective Views',
    summary: 'Create the Conveyor view, add the embedded view page, and verify each embedded conveyor passes its parameter.',
    instructions: 'Rebuild the same conveyor concept in Perspective using a reusable view, a page route, and embedded views that pass different parameters.',
    preparation: [
      'Confirm the Perspective module is installed and the project has a Perspective section available in the Designer.',
      'Choose a container type before you begin. Flex is usually easiest for simple layouts, while Coordinate works well when you want fixed placement.',
      'Reuse the same conveyor names or numbers from the earlier labs so bindings and screenshots remain easy to compare across modules.',
    ],
    deliverables: [
      'Perspective Conveyor view with a ConveyorName parameter',
      'Lab work day 4 page at /labwork-day-4',
      'Four Embedded View components with different ConveyorName values',
    ],
    failurePoints: [
      'Using the wrong view container or size',
      'Forgetting to set the page URL',
      'Passing the wrong ConveyorName into an embedded view',
    ],
    steps: [
      { id: 'l4-1', instruction: 'Create a Perspective view named Conveyor with a ConveyorName input parameter and a container sized for a compact equipment card.', hint: 'A 300 by 300 design size works well for a starter layout, but the real requirement is that the view remains readable when embedded multiple times.' },
      { id: 'l4-2', instruction: 'Add a label, a stateful control, a writable numeric entry, and live displays for key values. Bind every tag path through the ConveyorName parameter so the view stays reusable.', hint: 'Perspective bindings can target tags, properties, expressions, and history, but the basic pattern here is a tag binding with a parameter driven path.' },
      { id: 'l4-3', instruction: 'Create a page view named Lab work day 4 and map it to the URL /labwork-day-4.', hint: 'Use the browser preview to confirm the route loads without a not found error.' },
      { id: 'l4-4', instruction: 'Place four Embedded View components on the page and pass different ConveyorName values into each one.', hint: 'If two cards show the same live values, inspect the embedded parameter objects before changing any bindings inside the child view.' },
    ],
    rubric: ['Perspective view created', 'Page URL set', 'Four embedded views added', 'Each embedded view shows correct data'],
    resources: [
      { label: 'Perspective overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/perspective' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
      { label: 'Ignition documentation home', url: 'https://docs.inductiveautomation.com/' },
    ],
  },
  {
    id: 'lab-5',
    title: 'Lab 5: Reporting',
    summary: 'Create the report, bind the date range, and show it in the Vision window.',
    instructions: 'Use the historized conveyor data to build a practical report. The missing worksheet is replaced here with a report layout that exercises core reporting tasks covered by the public manual and Inductive University.',
    preparation: [
      'Complete Lab 3 first so the historian contains meaningful rows for Speed and SpeedSP.',
      'Verify the Reporting module is installed and the Reports section appears in the Project Browser.',
      'Decide which time range gives visible data before you build the report viewer screen, otherwise the report may appear empty even when configured correctly.',
    ],
    deliverables: [
      'Lab work day 5 report',
      'Tag Historian Query named Conveyor',
      'Report table and Timeseries chart',
      'Vision window with Report Viewer and Date Range',
    ],
    failurePoints: [
      'Binding the report to the wrong data key',
      'Leaving the date range disconnected from the viewer',
      'Forgetting to include all query columns in the table',
    ],
    steps: [
      { id: 'l5-1', instruction: 'Create a report named Lab work day 5 and add a historian style data source that returns conveyor history for the active date range.', hint: 'A fixed sample size of about 100 keeps the report readable while still showing change over time.' },
      { id: 'l5-2', instruction: 'Design the report with a title, start and end date display, a table of historian rows, and a timeseries chart comparing actual speed to the setpoint.', hint: 'Make the data key names explicit and reuse the same key in both the table and the chart so you only have one source of truth.' },
      { id: 'l5-3', instruction: 'Create a Vision window that contains a Report Viewer and a Date Range component, then bind the viewer parameters to the chosen start and end dates.', hint: 'The most common failure here is binding only one date or binding to a property name that does not match the report parameter.' },
      { id: 'l5-4', instruction: 'Preview the report for multiple date windows and confirm that the table, chart, and page count all respond to the selected range.', hint: 'If the report looks empty, test the underlying data source first before changing the layout.' },
    ],
    rubric: ['Report created', 'Historian query added', 'Date range bound', 'Viewer updates with date range'],
    resources: [
      { label: 'Reporting module overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/reporting' },
      { label: 'Vision module overview', url: 'https://www.docs.inductiveautomation.com/docs/8.1/ignition-modules/vision' },
      { label: 'Inductive University 8.1 course map', url: 'https://inductiveuniversity.com/courses/ignition/ignition-overview/8.1' },
    ],
  },
]
