import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export type TCParameter = {
  parameter_name: string;
  category: 'chemical' | 'mechanical' | 'dimensional';
  unit: string | null;
  min_value: number | null;
  max_value: number | null;
  observed_value: number;
  validation_status: string;
};

// Backward-compatible alias for older imports.
export type TCParameterRow = TCParameter;

export type TCData = {
  tc_number: string;
  version: number;
  tc_type: string;
  issue_date: string;
  plant_name: string;
  plant_location: string | null;
  customer_name: string | null;
  po_number: string;
  wo_number: string;
  item_code: string;
  item_description: string | null;
  quantity: number | null;
  dispatch_date: string | null;
  heat_number: string;
  supplier_name: string | null;
  material_grade: string | null;
  allocated_quantity: number;
  parameters: TCParameter[];
  prepared_by_name: string | null;
  approved_by_name: string | null;
};

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, textAlign: 'center', borderBottom: '1px solid #000', paddingBottom: 10 },
  companyName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  subHeader: { fontSize: 12, marginBottom: 2 },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 5, backgroundColor: '#eee', padding: 3 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: '30%', fontWeight: 'bold' },
  value: { width: '70%' },
  table: { width: 'auto', borderStyle: 'solid', borderWidth: 1, borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableCol: { width: '16.6%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0 },
  tableCell: { margin: 'auto', marginTop: 5, marginBottom: 5, fontSize: 9 },
  tableHeader: { backgroundColor: '#f0f0f0', fontWeight: 'bold' },
  signatureBlock: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { width: '40%', borderTop: '1px solid #000', paddingTop: 10, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 8, color: '#666' },
});

// Helper for table rendering
const ParameterTable = ({ title, data }: { title: string, data: TCParameter[] }) => {
  if (data.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>Parameter</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>Unit</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>Min</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>Max</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>Observed</Text></View>
          <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>Status</Text></View>
        </View>
        {data.map((p, i) => (
          <View style={styles.tableRow} key={i}>
            <View style={[styles.tableCol, { width: '25%' }]}><Text style={styles.tableCell}>{p.parameter_name}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{p.unit || '-'}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{p.min_value ?? '-'}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{p.max_value ?? '-'}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{p.observed_value}</Text></View>
            <View style={[styles.tableCol, { width: '15%' }]}><Text style={styles.tableCell}>{p.validation_status}</Text></View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const TCDocument = ({ data }: { data: TCData }) => {
  const chemicalParams = data.parameters.filter(p => p.category === 'chemical');
  const mechanicalParams = data.parameters.filter(p => p.category === 'mechanical');
  const dimensionalParams = data.parameters.filter(p => p.category === 'dimensional');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>{data.plant_name}</Text>
          <Text style={styles.subHeader}>{data.plant_location}</Text>
          <Text style={[styles.subHeader, { marginTop: 10, fontSize: 14, fontWeight: 'bold' }]}>TEST CERTIFICATE ({data.tc_type})</Text>
          <Text style={styles.subHeader}>According to EN 10204</Text>
        </View>

        {/* Certificate Details */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ width: '48%' }}>
             <View style={styles.row}><Text style={styles.label}>TC No:</Text><Text style={styles.value}>{data.tc_number}</Text></View>
             <View style={styles.row}><Text style={styles.label}>Version:</Text><Text style={styles.value}>{data.version}</Text></View>
             <View style={styles.row}><Text style={styles.label}>Date:</Text><Text style={styles.value}>{data.issue_date}</Text></View>
          </View>
          <View style={{ width: '48%' }}>
             <View style={styles.row}><Text style={styles.label}>Customer:</Text><Text style={styles.value}>{data.customer_name || '-'}</Text></View>
             <View style={styles.row}><Text style={styles.label}>PO No:</Text><Text style={styles.value}>{data.po_number || '-'}</Text></View>
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.row}><Text style={styles.label}>Work Order:</Text><Text style={styles.value}>{data.wo_number}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Item Code:</Text><Text style={styles.value}>{data.item_code}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Description:</Text><Text style={styles.value}>{data.item_description || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Quantity:</Text><Text style={styles.value}>{data.quantity} {data.parameters[0]?.unit}</Text></View>
        </View>

        {/* Traceability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traceability</Text>
          <View style={styles.row}><Text style={styles.label}>Heat No:</Text><Text style={styles.value}>{data.heat_number}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Material Grade:</Text><Text style={styles.value}>{data.material_grade || '-'}</Text></View>
           <View style={styles.row}><Text style={styles.label}>Supplier:</Text><Text style={styles.value}>{data.supplier_name || '-'}</Text></View>
        </View>

        {/* Test Results */}
        <ParameterTable title="Chemical Composition" data={chemicalParams} />
        <ParameterTable title="Mechanical Properties" data={mechanicalParams} />
        <ParameterTable title="Dimensional Inspection" data={dimensionalParams} />

        {/* Compliance Statement */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Compliance Statement</Text>
          <Text style={{ fontSize: 9 }}>
            We hereby certify that the material described above has been tested and complies with the requirements of the order and the specified standards.
            The results are true and correct to the best of our knowledge.
          </Text>
        </View>

        {/* Signatures */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureBox}>
            <Text>{data.prepared_by_name || 'System'}</Text>
            <Text style={{ fontSize: 8, color: '#666', marginTop: 4 }}>Prepared By</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>{data.approved_by_name || 'Pending'}</Text>
            <Text style={{ fontSize: 8, color: '#666', marginTop: 4 }}>Approved By</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          This document is system generated. Validation of authenticity can be performed via OpSuite Portal.
        </Text>
      </Page>
    </Document>
  );
};

export default TCDocument;
