import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export type TCParameterRow = {
  parameterName: string;
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  observedValue: number;
  validationStatus: string;
};

export type TCDocumentProps = {
  tcId: string;
  version: number;
  woNumber: string;
  poNumber: string | null;
  customerName: string | null;
  generatedAt: string;
  parameters: TCParameterRow[];
};

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 11, lineHeight: 1.4 },
  header: { marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 8 },
  title: { fontSize: 16, marginBottom: 6, fontWeight: 700 },
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { width: 120, fontWeight: 600 },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    paddingBottom: 4,
    marginTop: 12,
    marginBottom: 4,
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 4 },
  c1: { width: '28%' },
  c2: { width: '18%' },
  c3: { width: '18%' },
  c4: { width: '18%' },
  c5: { width: '18%' },
});

export function TCDocument(props: TCDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Test Certificate</Text>
          <View style={styles.row}>
            <Text style={styles.label}>TC ID:</Text>
            <Text>{props.tcId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Version:</Text>
            <Text>{props.version}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Generated At:</Text>
            <Text>{new Date(props.generatedAt).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>WO Number:</Text>
            <Text>{props.woNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PO Number:</Text>
            <Text>{props.poNumber || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Customer:</Text>
            <Text>{props.customerName || '-'}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.c1}>Parameter</Text>
          <Text style={styles.c2}>Range</Text>
          <Text style={styles.c3}>Observed</Text>
          <Text style={styles.c4}>Unit</Text>
          <Text style={styles.c5}>Status</Text>
        </View>

        {props.parameters.map((p, idx) => (
          <View style={styles.tableRow} key={`${p.parameterName}-${idx}`}>
            <Text style={styles.c1}>{p.parameterName}</Text>
            <Text style={styles.c2}>
              {p.minValue ?? '-'} to {p.maxValue ?? '-'}
            </Text>
            <Text style={styles.c3}>{p.observedValue}</Text>
            <Text style={styles.c4}>{p.unit || '-'}</Text>
            <Text style={styles.c5}>{p.validationStatus}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
