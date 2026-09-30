export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "datetime"
  | "checkbox"
  | "select";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
};

export type CrudModuleConfig = {
  listPath: string;
  itemPath: (id: number) => string;
  itemLabel: string;
  fields: FieldConfig[];
  titleField: string;
  toggleField?: string;
  toggleLabel?: (checked: boolean) => string;
};

export const CRUD_MODULE_CONFIGS: Record<string, CrudModuleConfig> = {
  chores: {
    listPath: "/api/chores/",
    itemPath: (id) => `/api/chores/${id}`,
    itemLabel: "Chore",
    titleField: "title",
    toggleField: "done",
    toggleLabel: (checked) => (checked ? "Done" : "Mark done"),
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "assignee", label: "Assignee", type: "text" },
      { name: "points", label: "Points", type: "number" },
      { name: "due_date", label: "Due date", type: "date" },
    ],
  },
  calendar: {
    listPath: "/api/calendar/events",
    itemPath: (id) => `/api/calendar/events/${id}`,
    itemLabel: "Event",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "start_time", label: "Start", type: "datetime", required: true },
      { name: "location", label: "Location", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  meals: {
    listPath: "/api/meals/recipes",
    itemPath: (id) => `/api/meals/recipes/${id}`,
    itemLabel: "Recipe",
    titleField: "title",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      {
        name: "ingredients",
        label: "Ingredients (one per line)",
        type: "textarea",
        required: true,
      },
      { name: "instructions", label: "Instructions", type: "textarea" },
      { name: "tags", label: "Tags", type: "text" },
    ],
  },
  pantry: {
    listPath: "/api/pantry/items",
    itemPath: (id) => `/api/pantry/items/${id}`,
    itemLabel: "Pantry item",
    titleField: "name",
    toggleField: "low_stock",
    toggleLabel: (checked) => (checked ? "Low stock" : "Mark low stock"),
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "quantity", label: "Quantity", type: "number" },
      { name: "unit", label: "Unit", type: "text" },
      { name: "expiry_date", label: "Expiry date", type: "date" },
    ],
  },
  grocery: {
    listPath: "/api/grocery/items",
    itemPath: (id) => `/api/grocery/items/${id}`,
    itemLabel: "Grocery item",
    titleField: "name",
    toggleField: "purchased",
    toggleLabel: (checked) => (checked ? "Purchased" : "Mark purchased"),
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "quantity", label: "Quantity", type: "number" },
    ],
  },
  notes: {
    listPath: "/api/notes/",
    itemPath: (id) => `/api/notes/${id}`,
    itemLabel: "Note",
    titleField: "title",
    toggleField: "pinned",
    toggleLabel: (checked) => (checked ? "Pinned" : "Pin"),
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "content", label: "Content", type: "textarea" },
    ],
  },
  finance: {
    listPath: "/api/finance/entries",
    itemPath: (id) => `/api/finance/entries/${id}`,
    itemLabel: "Entry",
    titleField: "description",
    fields: [
      { name: "description", label: "Description", type: "text", required: true },
      { name: "amount", label: "Amount", type: "number", required: true },
      {
        name: "entry_type",
        label: "Type",
        type: "select",
        options: [
          { value: "expense", label: "Expense" },
          { value: "income", label: "Income" },
        ],
      },
      { name: "category", label: "Category", type: "text" },
      { name: "date", label: "Date", type: "date", required: true },
    ],
  },
  health: {
    listPath: "/api/health-tracking/records",
    itemPath: (id) => `/api/health-tracking/records/${id}`,
    itemLabel: "Record",
    titleField: "description",
    fields: [
      { name: "family_member", label: "Family member", type: "text", required: true },
      {
        name: "record_type",
        label: "Type",
        type: "select",
        options: [
          { value: "appointment", label: "Appointment" },
          { value: "vital", label: "Vital" },
          { value: "medication", label: "Medication" },
        ],
      },
      { name: "description", label: "Description", type: "text", required: true },
      { name: "date", label: "Date", type: "date", required: true },
    ],
  },
  school: {
    listPath: "/api/school/",
    itemPath: (id) => `/api/school/${id}`,
    itemLabel: "Entry",
    titleField: "title",
    fields: [
      { name: "title", label: "Subject / assignment", type: "text", required: true },
      { name: "value", label: "Grade / score", type: "text" },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  "sat-tracker": {
    listPath: "/api/sat/",
    itemPath: (id) => `/api/sat/${id}`,
    itemLabel: "Session",
    titleField: "title",
    fields: [
      { name: "title", label: "Practice / test name", type: "text", required: true },
      { name: "value", label: "Score", type: "text" },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  "spelling-tracker": {
    listPath: "/api/spelling/",
    itemPath: (id) => `/api/spelling/${id}`,
    itemLabel: "Entry",
    titleField: "title",
    fields: [
      { name: "title", label: "Word list / test", type: "text", required: true },
      { name: "value", label: "Score", type: "text" },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
  "shloka-tracker": {
    listPath: "/api/shloka/",
    itemPath: (id) => `/api/shloka/${id}`,
    itemLabel: "Entry",
    titleField: "title",
    fields: [
      { name: "title", label: "Shloka", type: "text", required: true },
      { name: "value", label: "Status", type: "text" },
      { name: "date", label: "Date", type: "date", required: true },
      { name: "notes", label: "Notes", type: "textarea" },
    ],
  },
};
