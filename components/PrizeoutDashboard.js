import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  FlatList,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './AllComponents';
import { collection, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import prizeoutService from '../services/prizeoutService';

const PrizeoutDashboard = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [enabledRetailers, setEnabledRetailers] = useState(new Set());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCommissionSummary(),
        loadRecentTransactions(),
        loadRetailers()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const loadCommissionSummary = async () => {
    try {
      // Get summary for last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const summaryData = await prizeoutService.getCommissionSummary(
        Timestamp.fromDate(thirtyDaysAgo),
        Timestamp.fromDate(new Date())
      );
      
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading commission summary:', error);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const q = query(
        collection(db, 'commissionLedger'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const transactions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRecentTransactions(transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadRetailers = async () => {
    try {
      const retailerList = await prizeoutService.getRetailers();
      setRetailers(retailerList);
      
      // Load enabled retailers from settings
      // This would come from Firestore settings collection
      const enabledSet = new Set(retailerList.slice(0, 10).map(r => r.id)); // Default to first 10
      setEnabledRetailers(enabledSet);
    } catch (error) {
      console.error('Error loading retailers:', error);
    }
  };

  const toggleRetailer = (retailerId) => {
    const newEnabledRetailers = new Set(enabledRetailers);
    if (newEnabledRetailers.has(retailerId)) {
      newEnabledRetailers.delete(retailerId);
    } else {
      newEnabledRetailers.add(retailerId);
    }
    setEnabledRetailers(newEnabledRetailers);
    
    // TODO: Save to Firestore settings
    // saveRetailerSettings(Array.from(newEnabledRetailers));
  };

  const renderKPICard = ({ title, value, subtitle, color, icon }) => (
    <View style={[styles.kpiCard, { borderLeftColor: color }]}>
      <View style={styles.kpiHeader}>
        <Ionicons name={icon} size={24} color={color} />
        <Text style={styles.kpiTitle}>{title}</Text>
      </View>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionRetailer}>{item.retailer}</Text>
          <Text style={styles.transactionDate}>
            {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
          </Text>
        </View>
        <View style={styles.transactionAmounts}>
          <Text style={styles.transactionFaceValue}>
            ${item.faceValue?.toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.transactionCommission}>
            +${item.commissionAmount?.toFixed(2) || '0.00'}
          </Text>
        </View>
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionUser}>User: {item.userId}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  const renderRetailerItem = ({ item }) => (
    <View style={styles.retailerItem}>
      <View style={styles.retailerInfo}>
        <Text style={styles.retailerName}>{item.name}</Text>
        <Text style={styles.retailerCategory}>{item.category}</Text>
      </View>
      <Switch
        value={enabledRetailers.has(item.id)}
        onValueChange={() => toggleRetailer(item.id)}
        trackColor={{ false: '#767577', true: theme.colors.primary }}
        thumbColor={enabledRetailers.has(item.id) ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#2ed573';
      case 'failed': return '#ff3333';
      case 'pending': return '#ffa502';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Prizeout Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎁 Prizeout Dashboard</Text>
        <Text style={styles.headerSubtitle}>Gift Card Monetization Analytics</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        {renderKPICard({
          title: 'Total Redemptions',
          value: summary?.totalRedemptions?.toString() || '0',
          subtitle: 'Last 30 days',
          color: '#3742fa',
          icon: 'gift'
        })}
        
        {renderKPICard({
          title: 'Bonus Given',
          value: `$${summary?.totalBonusValue?.toFixed(2) || '0.00'}`,
          subtitle: 'Customer savings',
          color: '#2ed573',
          icon: 'trending-up'
        })}
        
        {renderKPICard({
          title: 'Your Commission',
          value: `$${summary?.totalCommission?.toFixed(2) || '0.00'}`,
          subtitle: 'Revenue earned',
          color: '#ffa502',
          icon: 'cash'
        })}
        
        {renderKPICard({
          title: 'Avg Redemption',
          value: `$${summary?.avgRedemptionValue?.toFixed(2) || '0.00'}`,
          subtitle: 'Per transaction',
          color: '#9c88ff',
          icon: 'stats-chart'
        })}
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        
        {recentTransactions.length > 0 ? (
          <FlatList
            data={recentTransactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </View>

      {/* Retailer Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Retailer Settings</Text>
        <Text style={styles.sectionSubtitle}>
          Control which retailers are available to your users
        </Text>
        
        {retailers.length > 0 ? (
          <FlatList
            data={retailers}
            renderItem={renderRetailerItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No retailers available</Text>
          </View>
        )}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuration</Text>
        
        <View style={styles.configItem}>
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>Commission Rate</Text>
            <Text style={styles.configValue}>3.0%</Text>
          </View>
        </View>
        
        <View style={styles.configItem}>
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>Bonus Percentage</Text>
            <Text style={styles.configValue}>25%</Text>
          </View>
        </View>
        
        <View style={styles.configItem}>
          <View style={styles.configInfo}>
            <Text style={styles.configLabel}>Integration Status</Text>
            <Text style={[
              styles.configValue,
              { color: summary ? '#2ed573' : '#ff3333' }
            ]}>
              {summary ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  kpiTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  kpiSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  section: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  transactionItem: {
    paddingVertical: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionRetailer: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  transactionAmounts: {
    alignItems: 'flex-end',
  },
  transactionFaceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  transactionCommission: {
    fontSize: 14,
    color: '#2ed573',
    fontWeight: '500',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionUser: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  retailerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  retailerInfo: {
    flex: 1,
  },
  retailerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  retailerCategory: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  configInfo: {
    flex: 1,
  },
  configLabel: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  configValue: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 12,
  },
});

export default PrizeoutDashboard;
