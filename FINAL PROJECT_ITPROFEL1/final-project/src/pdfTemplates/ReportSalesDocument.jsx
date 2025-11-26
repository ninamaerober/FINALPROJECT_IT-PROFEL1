// ReportSalesDocument.jsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  headerBar: {
    backgroundColor: "#4F46E5", 
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 25,
  },
  title: {
    fontSize: 22,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  promotion: {
    marginBottom: 20,
    fontSize: 14,
    color: "#256D24",
    textAlign: "center",
    fontStyle: "italic",
  },
  table: {
    display: "table",
    width: "100%",
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#6366F1", 
  },
  tableColHeader: {
    flexGrow: 2,
    padding: 10,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  tableCol: {
    flexGrow: 2,
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
    textAlign: "center",
  },
  rowEven: {
    backgroundColor: "#F9FAFB",
  },
  statusPaid: {
    backgroundColor: "#34D399",
    color: "#064E3B",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 11,
  },
  statusPending: {
    backgroundColor: "#FCD34D",
    color: "#78350F",
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 11,
  },
});

export const ReportSalesDocument = ({ payments, activePromotion }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.title}>Hotel Sales Report</Text>
        </View>

        {/* Promotion */}
        {activePromotion && (
          <Text style={styles.promotion}>
            🎉 Active Promotion: "{activePromotion.title}" — {activePromotion.discount}% discount applied
          </Text>
        )}

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableColHeader}>Guest</Text>
            <Text style={styles.tableColHeader}>Amount</Text>
            <Text style={styles.tableColHeader}>Status</Text>
          </View>

          {/* Table Rows */}
          {payments.map((p, index) => (
            <View
              key={p.id}
              style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : null]}
            >
              <Text style={styles.tableCol}>{p.guest}</Text>
              <Text style={styles.tableCol}>₱{p.amount.toLocaleString()}</Text>
              <Text
                style={[
                  p.status === "Paid" ? styles.statusPaid : styles.statusPending,
                  { margin: "auto" },
                ]}
              >
                {p.status}
              </Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};
