//screens/AddExpense.js
import React, { useState } from 'react';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { db } from '../firebase';
import {collection, getDocs, query, where, addDoc } from 'firebase/firestore';

const AddExpense = ({ navigation }) => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    //Gider kategorilerini çek
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const q = query(collection(db, 'categories'));
                const querySnapshot = await getDocs(q);
                const categoryList = querySnapshot.docs.map(doc =>({
                    id: doc.id,
                    ...doc.data()
                }));
                setCategories(categoryList);
            } catch (error) {
                console.error('Kategoriler alınamadı:', error);
                }
        };
        fetchCategories();
    }, []);
    
    const handleAddExpense = async () => {
        if (!amount || !selectedCategory || !date) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }

        try {
            await addDoc(collection(db, 'expenses'), {
                amount: parseFloat(amount),
                category: selectedCategory,
                //date: date.toISOString(),
                date: date.toISOString(),
                createdAt: new Date(),
            });
            alert('Gider eklendi!');
            navigation.goBack();
        } catch (error) {
            console.error('Gider eklenemedi: ', error);
            alert('Bir hata oluştu.');
        }
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
            <Text style={styles.label}>Kategori:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    >
                    <Picker.Item label="Kategori Seçin" value="" />
                    {categories.map((cat) => (
                        <Picker.Item key={cat.id} label={cat.name} value={cat.name} />
                    ))}
                </Picker>
            </View>
            <Button mode="outlined" onPress={() => setShowPicker(true)} style={styles.input}>
                Tarih Seç: {date.toDateString()}
            </Button>
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowPicker(false);
                        if (selectedDate) setDate(selectedDate);
                    }}
                />
            )}
            <Button mode="contained" onPress={handleAddExpense}>
                Gideri Ekle
            </Button>
        </View>
    );
    };

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        justifyContent: 'center',
    },
    input: {
        marginBottom: 15,
    },
});

export default AddExpense;
