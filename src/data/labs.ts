export type LabStep = {
  id: string
  instruction: string
  hint: string
}

export type LabTheme = {
  id: string
  title: string
  summary: string
  instructions: string
  deliverables: string[]
  failurePoints: string[]
  steps: LabStep[]
  rubric: string[]
}

export const labs: LabTheme[] = [
  {
    id: 'lab-1',
    title: 'Lab 1: Device, Tag Groups, Tags, and Vision',
    summary: 'Create the simulator connection, build the tag group, load tags, and place Vision controls for two conveyors.',
    instructions: 'Use the LabWorkSim device, LabWorkRate tag group, and Lab work day 1 Vision window from the class notes.',
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
      { id: 'l1-1', instruction: 'Create the LabWorkSim device connection and import the provided CSV tag program.', hint: 'Use the Gateway webpage for the device and the Designer for tags.' },
      { id: 'l1-2', instruction: 'Create the LabWorkRate tag group with a constant two second update rate.', hint: 'The conveyor values should update every two seconds.' },
      { id: 'l1-3', instruction: 'Add the LabWorkSim tag folder and create 15 Conveyor folders inside it.', hint: 'Match the folder structure to the simulator data.' },
      { id: 'l1-4', instruction: 'Build the Lab work day 1 Vision window with two conveyor displays and navigation.', hint: 'Add the label, symbol, LED displays, and HOA control.' },
    ],
    rubric: ['Device connection created', 'Tag group at 2 second rate', 'Two conveyor display sets added', 'HOA value can be changed'],
  },
  {
    id: 'lab-2',
    title: 'Lab 2: UDTs and Vision Templates',
    summary: 'Create the Conveyor UDT, make instances, build the template, and place four conveyor instances on the day 2 window.',
    instructions: 'Use the UDT and template tasks from the day 2 lab sheet.',
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
      { id: 'l2-1', instruction: 'Create the Conveyor UDT and add the ConveyorNumber parameter.', hint: 'The UDT should build dynamic item paths for each conveyor.' },
      { id: 'l2-2', instruction: 'Create 15 instances in ConveyorInstances using the Multi instance Wizard.', hint: 'Preview the numbering before finishing.' },
      { id: 'l2-3', instruction: 'Build the Conveyor Template with a parameter and indirect bindings.', hint: 'The same template should work for any conveyor number.' },
      { id: 'l2-4', instruction: 'Add four template instances to Lab work day 2 and set them to 1, 6, 10, and 15.', hint: 'Verify the correct data shows in each instance.' },
    ],
    rubric: ['UDT instances created', 'Template binds correctly', 'Four template instances visible', 'HOA writes correctly'],
  },
  {
    id: 'lab-3',
    title: 'Lab 3: History, Alarms, Security, Popups, and Charts',
    summary: 'Enable history, add alarms, secure the popup field, and open the popup from the template.',
    instructions: 'Use the day 3 worksheet and remember to keep the popup filtering exact.',
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
      { id: 'l3-1', instruction: 'Enable tag history on the Conveyor UDT tags and use the database connection as the storage provider.', hint: 'Use the same database from the lab setup.' },
      { id: 'l3-2', instruction: 'Add the Faulted and High Speed alarms with the correct setpoints and binding.', hint: 'The HOA alarm uses Equal mode and the speed alarm uses SpeedSP.' },
      { id: 'l3-3', instruction: 'Build the Lab work day 3 popup with a parameter, numeric field, alarm table, and Easy Chart.', hint: 'The display path filter must isolate the selected conveyor.' },
      { id: 'l3-4', instruction: 'Open the popup from the Conveyor Template and pass the template parameter.', hint: 'The popup should show the same conveyor that was clicked.' },
    ],
    rubric: ['History enabled', 'Alarms configured', 'Security applied to edit control', 'Popup opens for different conveyors'],
  },
  {
    id: 'lab-4',
    title: 'Lab 4: Perspective Views',
    summary: 'Create the Conveyor view, add the embedded view page, and verify each embedded conveyor passes its parameter.',
    instructions: 'Use the day 4 worksheet and verify the page URL is correct.',
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
      { id: 'l4-1', instruction: 'Create the Conveyor view with a Coordinate or Flex layout and a ConveyorName parameter.', hint: 'Set the design size to 300 by 300.' },
      { id: 'l4-2', instruction: 'Add the Label, Multi state Button, Numeric Entry Field, and LED displays with indirect bindings.', hint: 'Keep the labels and values aligned with the selected conveyor.' },
      { id: 'l4-3', instruction: 'Create the Lab work day 4 page view and set the URL to /labwork-day-4.', hint: 'The page must load from the browser.' },
      { id: 'l4-4', instruction: 'Add four Embedded Views and pass a different ConveyorName into each one.', hint: 'Verify each conveyor shows unique data.' },
    ],
    rubric: ['Perspective view created', 'Page URL set', 'Four embedded views added', 'Each embedded view shows correct data'],
  },
  {
    id: 'lab-5',
    title: 'Lab 5: Reporting',
    summary: 'Create the report, bind the date range, and show it in the Vision window.',
    instructions: 'Use the day 5 worksheet and keep the report data and design screens organized.',
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
      { id: 'l5-1', instruction: 'Create the Conveyor Tag Historian Query and add the historian data columns.', hint: 'Keep the sample size fixed at 100.' },
      { id: 'l5-2', instruction: 'Design the report layout with the title, dates, table, and Timeseries chart.', hint: 'The table should show all returned query columns.' },
      { id: 'l5-3', instruction: 'Create the Lab work day 5 Vision window with a Report Viewer and Date Range component.', hint: 'Bind both start and end parameters to the viewer.' },
      { id: 'l5-4', instruction: 'Confirm changing the date range updates the report data.', hint: 'The report should refresh from the Date Range selection.' },
    ],
    rubric: ['Report created', 'Historian query added', 'Date range bound', 'Viewer updates with date range'],
  },
]
