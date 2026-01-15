import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Card } from 'react-native-paper';
// 1. BU SATIR ÇOK ÖNEMLİ, BUNU EKLEMEK ZORUNDASIN
import { useIsFocused } from '@react-navigation/native';

const AllExpense = ({ navigation }) => {
    const [expenses, setExpenses] = useState([]);
    
    // 2. Hook'u burada tanımlıyoruz. Bu değişken ekran görünürse 'true' olur.
    const isFocused = useIsFocused();

    const fetchExpenses = async () => {
        console.log("Veriler Firestore'dan çekiliyor..."); // Konsoldan takip et
        try {
            const q = query(collection(db, 'expenses'), orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            const expensesList = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            }));
            setExpenses(expensesList);
        } catch (error) {
            console.error("Gider verileri alınmadı: ", error);
        }
    };

    // 3. useEffect ARTIK 'isFocused' DEĞİŞKENİNİ DİNLİYOR
    useEffect(() => {
        if (isFocused) {
            // Ekran her odağa geldiğinde (Geri dönüldüğünde) burası çalışır
            fetchExpenses();
        }
    }, [isFocused]); // Köşeli parantez içine isFocused yazdık

    const renderItem = ({ item }) => (
        <TouchableOpacity key={item.id} onPress={() => navigation.navigate('ExpenseEdit', { expense: item })}>
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.itemText}>Kategori: {item.category}</Text>
                    <Text style={styles.itemText}>₺{item.amount}</Text>
                    <Text style={styles.itemText}>Tarih: {new Date(item.date).toLocaleDateString('tr-TR')}</Text>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    card: {
        marginBottom: 10,
    },
    itemText: {
        fontSize: 16,
        marginBottom: 5,
    },
});
    
export default AllExpense;