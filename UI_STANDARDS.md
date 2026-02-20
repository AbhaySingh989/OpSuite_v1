# UI Standards

## Global Principles
- **Framework**: Mantine UI (8.x)
- **Theme**: Default Mantine theme with minimal overrides.
- **Font**: System font stack (Inter, Segoe UI, Roboto, etc.).
- **Spacing**: Use Mantine spacing constants (xs, sm, md, lg, xl).
- **Icons**: @tabler/icons-react (size: 16px for inline, 20px for buttons).

## Typography
- **Headings**:
    - Page Titles: `Title order={2}` (size: h2, weight: 700)
    - Section Headers: `Title order={3}` (size: h3, weight: 600)
    - Card Titles: `Text fw={500} size="lg"`
- **Body Text**:
    - Default: `Text size="sm"` (14px)
    - Secondary/Dimmed: `Text c="dimmed" size="sm"`
    - Small Labels: `Text size="xs"` (12px)

## Components

### Buttons
- **Primary Actions** (Save, Submit, Create): `Button variant="filled" color="blue"`
- **Secondary Actions** (Cancel, Back): `Button variant="default"`
- **Destructive Actions** (Delete, Reject): `Button variant="filled" color="red"`
- **Icon Buttons**: `ActionIcon variant="subtle" color="gray"`

### Forms
- **Input Fields**: `TextInput`, `NumberInput`, `Select`, `Textarea`
- **Size**: `size="sm"`
- **Label**: Required for all inputs.
- **Placeholder**: Descriptive placeholders required.
- **Validation**: Inline error messages using `form.errors`.

### Data Tables
- **Library**: Mantine `Table` from `@mantine/core` using compound components (`Table`, `Table.Thead`, `Table.Tbody`, `Table.Tr`, `Table.Th`, `Table.Td`).
- **Header**: `Table.Th fw={600}` with background `gray.1`.
- **Rows**: Hover effect enabled via `highlightOnHover`.
- **Pagination**: Project-level pagination control at the bottom.
- **Actions**: Edit/Delete icons in the last column.

### Modals
- **Title**: Clear action title (e.g., "Create Customer").
- **Size**:
    - Simple Forms: `size="md"`
    - Complex Forms: `size="lg"` or `size="xl"`
- **Footer**: Right-aligned action buttons (Cancel left, Submit right).

### Notifications
- **Success**: `notifications.show({ title: 'Success', message: '...', color: 'green' })`
- **Error**: `notifications.show({ title: 'Error', message: '...', color: 'red' })`
- **Info**: `notifications.show({ title: 'Info', message: '...', color: 'blue' })`

## Layout
- **Page Container**: `Container fluid p="md"`
- **Page Header**: Flex row with Title on left, Actions on right.
- **Content Spacing**: `Stack gap="md"` for vertical rhythm.
