# UI Standards

## Global Principles
- **Framework**: Mantine UI (v8.x)
- **Theme**: Default Mantine theme with minimal overrides to ensure upgradeability.
- **Font**: System font stack (Inter, Segoe UI, Roboto, Helvetica, Arial, sans-serif).
- **Color Scheme**:
  - Primary: Blue (`blue.6` for actions, `blue.1` for subtle backgrounds)
  - Success: Green (`green.6`)
  - Warning: Yellow/Orange (`yellow.6`)
  - Error: Red (`red.6`)
  - Neutral: Gray (`gray.6` for text, `gray.1` for backgrounds)
- **Spacing**: Use Mantine spacing constants (`xs`, `sm`, `md`, `lg`, `xl`). Default gap is `md`.
- **Icons**: @tabler/icons-react (size: 16px for inline, 20px for buttons).

## Typography
- **Headings**:
    - Page Titles: `Title order={2} size="h2" fw={700}`
    - Section Headers: `Title order={3} size="h3" fw={600}`
    - Card/Component Titles: `Text fw={500} size="lg"`
- **Body Text**:
    - Default: `Text size="sm"` (14px)
    - Secondary/Dimmed: `Text c="dimmed" size="sm"`
    - Small Labels: `Text size="xs" c="dimmed"` (12px)

## Components

### Buttons
- **Primary Actions** (Save, Submit, Create): `Button variant="filled" color="blue"`
- **Secondary Actions** (Cancel, Back): `Button variant="default"`
- **Destructive Actions** (Delete, Reject): `Button variant="filled" color="red"`
- **Icon Buttons**: `ActionIcon variant="subtle" color="gray"`

### Forms
- **Input Fields**: `TextInput`, `NumberInput`, `Select`, `Textarea`
- **Size**: `size="sm"`
- **Label**: Required for all inputs. Use sentence case.
- **Placeholder**: Descriptive placeholders required.
- **Validation**: Inline error messages using `form.errors` (Mantine Form).
- **Layout**: Use `Stack` for vertical form layouts or `SimpleGrid` for multi-column.

### Data Tables
- **Library**: Mantine `Table` from `@mantine/core` using compound components (`Table`, `Table.Thead`, `Table.Tbody`, `Table.Tr`, `Table.Th`, `Table.Td`).
- **Header**: `Table.Th fw={600}` with background `gray.0` or `gray.1`.
- **Rows**: Hover effect enabled via `highlightOnHover`.
- **Pagination**: Project-level pagination control at the bottom.
- **Actions**: Edit/Delete icons in the last column.
- **Empty State**: Explicitly handle empty states with a centered `Text` or `Alert`.

### Status Indicators
- **Badge**: Use `Badge` for simple states.
  - Draft: `gray`
  - Pending: `blue` or `yellow`
  - Approved/Passed: `green`
  - Failed/Rejected: `red`
- **Stepper**: Use `Stepper` for workflow progress on detail pages or complex lists.
  - Active step: `blue`
  - Completed step: `green`
  - Error step: `red`

### Modals
- **Title**: Clear action title (e.g., "Create Customer").
- **Size**:
    - Simple Forms: `size="md"`
    - Complex Forms: `size="lg"` or `size="xl"`
- **Footer**: Right-aligned action buttons (Cancel left, Submit right).
- **Overlay**: Default dimming.

### Notifications
- **Success**: `notifications.show({ title: 'Success', message: '...', color: 'green' })`
- **Error**: `notifications.show({ title: 'Error', message: '...', color: 'red' })`
- **Info**: `notifications.show({ title: 'Info', message: '...', color: 'blue' })`

## Layout
- **Page Container**: `Container fluid p="md"`
- **Page Header**: Flex row with Title on left, Actions on right.
- **Content Spacing**: `Stack gap="md"` for vertical rhythm.
- **Cards**: `Card shadow="sm" padding="lg" radius="md" withBorder`.
