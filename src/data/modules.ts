import type { StudyModule } from '../types/app'

export const ignitionVersion = '8.1.45'

export const modules: StudyModule[] = [
  { id: 'architecture', title: 'Module 1: Ignition Architecture', summary: 'Gateway, Designer, projects, clients, sessions, modules, scope, trial mode, and licensing concepts.', lessonCount: 1 },
  { id: 'installation', title: 'Module 2: Installation and Gateway Configuration', summary: 'Install, open the Gateway page, manage modules, and understand backup and licensing basics.', lessonCount: 1 },
  { id: 'plc-database', title: 'Module 3: PLC and Database Connections', summary: 'OPC UA, device connections, simulator usage, browsing OPC data, and database connection basics.', lessonCount: 1 },
  { id: 'designer-projects', title: 'Module 4: Designer and Projects', summary: 'Designer Launcher, Project Browser, Tag Browser, component palette, property editor, preview, and publish.', lessonCount: 1 },
  { id: 'vision', title: 'Module 5: Vision', summary: 'Windows, root containers, components, navigation, and Vision Client workflows.', lessonCount: 1 },
  { id: 'bindings', title: 'Module 6: Component Properties and Bindings', summary: 'Tag, property, expression, bidirectional, indirect, and cell update bindings.', lessonCount: 1 },
  { id: 'tags', title: 'Module 7: Tags and Tag Groups', summary: 'OPC tags, memory tags, tag quality, tag paths, groups, scan rates, and read and write behavior.', lessonCount: 1 },
  { id: 'udts', title: 'Module 8: UDTs', summary: 'Definitions, instances, parameters, overrides, nested UDTs, and inheritance.', lessonCount: 1 },
  { id: 'templates', title: 'Module 9: Vision Templates', summary: 'Templates, parameters, instances, indirect bindings, repeaters, and reusable displays.', lessonCount: 1 },
  { id: 'history', title: 'Module 10: Tag History', summary: 'History providers, sample modes, deadbands, historical queries, and Easy Chart.', lessonCount: 1 },
  { id: 'transaction-groups', title: 'Module 11: Transaction Groups', summary: 'Historical, standard, and recipe groups plus store and forward concepts.', lessonCount: 1 },
  { id: 'security', title: 'Module 12: Security', summary: 'Authentication profiles, users, roles, component security, and project and gateway permissions.', lessonCount: 1 },
  { id: 'alarming', title: 'Module 13: Alarming', summary: 'Alarm states, priorities, modes, setpoints, filtering, and UDT alarms.', lessonCount: 1 },
  { id: 'alarm-history', title: 'Module 14: Alarm History', summary: 'Alarm journals, tables, event IDs, and historical alarm queries.', lessonCount: 1 },
  { id: 'notification', title: 'Module 15: Alarm Notification', summary: 'Contact info, rosters, profiles, pipelines, escalation, and dropout concepts.', lessonCount: 1 },
  { id: 'popups', title: 'Module 16: Popup Windows and Parameter Passing', summary: 'Popup parameters, dynamic labels, indirect bindings, and context aware alarm filtering.', lessonCount: 1 },
  { id: 'scripting', title: 'Module 17: Scripting', summary: 'Jython syntax, scopes, event scripts, project scripts, tag reads and writes, and the Script Console.', lessonCount: 1 },
  { id: 'perspective', title: 'Module 18: Perspective', summary: 'Views, pages, sessions, containers, parameters, embedded views, styles, and security.', lessonCount: 1 },
  { id: 'reporting', title: 'Module 19: Reporting', summary: 'Report data sources, parameters, charts, viewer usage, scheduling, and PDF generation concepts.', lessonCount: 1 },
]
