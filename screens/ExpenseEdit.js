// ExpenseEdit.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker'; 
import { db } from '../firebase';
import { doc, updateDoc, collection, getDocs, query, deleteDoc} from 'firebase/firestore';

const ExpenseEdit = ({ route, navigation }) => {

    const { expense } = route.params;

    const [categories, setCategories] = useState([]);
    const [amount, setAmount] = useState(String(expense.amount));
    const [category, setCategory] = useState(expense.category);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const fetchCategories = async () => {
            const q = query(collection(db, 'categories'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCategories(data);
            console.log(data)
            };

        fetchCategories();
    }, []);

    useEffect(() => {
        if (expense && expense.date) {
            const firestoreDate = expense.date;

            if (firestoreDate.toDate) {
            setDate(firestoreDate.toDate()); //Firestore Timestamp ise
            } else {
            setDate(new Date(firestoreDate)); //ISO String ya da timestamp ise
            }
        }
    }, [expense]);

    const handleUpdate = async () => {
        if (!amount || !category || !date) {
            alert('Tüm alanları doldurulmalıdır.');
            return;
        }
        Alert.alert( "Onay", "Bu kaydı güncellemek istediğinize emin misiniz?",
            [
                { text: "İptal", style: "cancel" },
                { text: "Evet", onPress: async () => {
                    try {
                    const expenseRef = doc(db, 'expenses', expense.id);
                    await updateDoc(expenseRef, {
                        amount: parseFloat(amount),
                        category,
                        date: date.toISOString(),
                    });
                    alert('Kayıt güncellendi!');
                    navigation.goBack();
                    }catch (error) {
                    console.error("Güncelleme hatası:", error);
                    alert("Güncelleme sırasında bir hata oluştu.");
                    }
                }
                }
            ]
            );
        };

    const handleDelete = async () => {
        Alert.alert( 'Silmek istediğinize emin misiniz?', 'Bu işlem geri alınamaz.',
            [
                { text: 'İptal', style: 'cancel' 
                },
                { text: 'Sil', style: 'destructive', onPress: async () => {
                    try {
                        await deleteDoc(doc(db, 'expenses', expense.id));
                        alert('Gider silindi.');
                        navigation.goBack();
                         } catch (error) {
                        console.error('Silme hatası:', error);
                        alert('Silme işlemi başarısız.');
                    }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <TextInput
                label="Tutar"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.input}
            />
            <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                style={styles.input} >
                {categories.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                ))}
                </Picker>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || date;
                        setShowDatePicker(false);
                        setDate(currentDate);
                    }}
                />
                )}
                <Button onPress={() => setShowDatePicker(true)}>
                    Tarih Seç: {date.toLocaleDateString()}
                </Button>
                <Button mode="contained" onPress={handleUpdate} style={styles.button}>
                    Güncelle
                </Button>
                <Button mode="contained" buttonColor="red" onPress={handleDelete} 
                style={{ marginTop: 10 }}>
                    Sil
                </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
    },
    input: {
        marginBottom: 15,
    },
});

export default ExpenseEdit;
            