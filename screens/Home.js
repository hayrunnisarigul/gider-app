import React, { useEffect, useState } from 'react';
import { Dimensions, View, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// 1. BU SATIRI EKLEMEK ZORUNDASIN
import { useIsFocused } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const Home = ({ navigation }) => {
    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [recentIncomes, setRecentIncomes] = useState([]);
    const [recentExpenses, setRecentExpenses] = useState([]);
    const [expenseData, setExpenseData] = useState([]);

    // 2. Odaklanma kancasını (Hook) tanımla
    const isFocused = useIsFocused();

    // Veri çekme fonksiyonlarını tanımlıyoruz
    const fetchExpenses = async () => {
        const querySnapshot = await getDocs(collection(db, 'expenses'));
        const rawData = [];

        querySnapshot.forEach((doc) => {
            rawData.push(doc.data());
        });
        
        const grouped = rawData.reduce((acc, curr) => {
            const { category, amount } = curr;
            acc[category] = (acc[category] || 0) + Number(amount);
            return acc;
        }, {});

        const pieData = Object.keys(grouped).map((key, index) => ({
            name: key,
            amount: grouped[key],
            color: getColor(index),
            legendFontColor: '#333',
            legendFontSize: 14,
        }));
        
        setExpenseData(pieData);
    };

    const fetchTotals = async () => {
        let incomeSum = 0;
        let expenseSum = 0;

        const incomeSnap = await getDocs(collection(db, 'incomes'));
        incomeSnap.forEach((doc) => {
            incomeSum += Number(doc.data().amount);
        });

        const expensesSnap = await getDocs(collection(db, 'expenses'));
        expensesSnap.forEach((doc) => {
            expenseSum += Number(doc.data().amount);
        });

        setTotalIncome(incomeSum);
        setTotalExpense(expenseSum);
    };

    const fetchRecent = async () => {
        const incomeQuery = query(collection(db, 'incomes'), orderBy('date', 'desc'), limit(3));
        const incomeSnap = await getDocs(incomeQuery);
        setRecentIncomes(incomeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const expenseQuery = query(collection(db, 'expenses'), orderBy('date', 'desc'), limit(3));
        const expenseSnap = await getDocs(expenseQuery);
        setRecentExpenses(expenseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    // 3. useEffect ARTIK 'isFocused' DEĞİŞKENİNİ DİNLİYOR
    useEffect(() => {
        if (isFocused) {
            // Sayfa her açıldığında veya geri gelindiğinde tüm verileri yeniden hesapla
            console.log("Ana Sayfa verileri güncelleniyor...");
            fetchExpenses();
            fetchTotals();
            fetchRecent();
        }
    }, [isFocused]); // Köşeli parantez içine isFocused yazdık

    // Renk paleti
    const colors = ['#f39c12', '#e74c3c', '#9b59b6', '#27ae60', '#3498db', '#2ecc', '#e67e22'];
    const getColor = (index) => colors[index % colors.length];

    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        useShadowColorFromDataset: false,
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Bütçe Özeti</Text>
            <Card style={styles.card}>
                <Card.Content>
                    <Text>Toplam Gider: ₺{totalExpense}</Text>
                    <Text>Kalan Bütçe: ₺{totalIncome - totalExpense}</Text>
                </Card.Content>
            </Card>

            <View style={styles.buttonContainer}>
                <Button mode="contained" onPress={() => navigation.navigate('AllExpense')} style={styles.button}>
                    Tüm Giderleri Görüntüle
                </Button>
                <Button mode="contained" onPress={() => navigation.navigate('ExpenseAdd')} style={styles.button}>
                    Gider Ekle
                </Button>
                <Button mode="contained" onPress={() => navigation.navigate('AddCategory')} style={styles.button}>
                    Kategori Ekle
                </Button>
            </View>

            <Text style={styles.header}>Son 3 Gider</Text>
            {recentExpenses.map((item) => (
                <Card key={item.id} style={styles.card}>
                    <Card.Content>
                        <Text>{item.category} - {item.amount} ₺</Text>
                        <Text>{new Date(item.date).toLocaleDateString('tr-TR')}</Text>
                    </Card.Content>
                </Card>
            ))}

            <Text style={styles.title}>Gider Dağılımı</Text>
            {expenseData.length > 0 ? (
                <PieChart
                    data={expenseData}
                    width={screenWidth} // +10 kaldırıldı, taşma yapabilir
                    height={220}
                    accessor="amount"
                    chartConfig={chartConfig}
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            ) : (
                <Text style={styles.message}>Henüz gider verisi yok.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10
    },
    card: {
        marginVertical: 6
    },
    buttonContainer: {
        flexDirection: 'column', // 'col' yanlıştı, 'column' olmalı
        justifyContent: 'space-between',
        marginVertical: 20,
    },
    button: {
        flex:1,
        marginVertical: 5
    },
    title: {
        fontSize: 20,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    message: {
        marginTop: 20, 
        fontSize: 16,
    }
});

export default Home;