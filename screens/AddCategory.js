import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const AddCategory = ({ navigation }) => {
    const [categoryName, setCategoryName] = React.useState('');
    const [categories, setCategories] = React.useState([]);

    const fetchCategories = async () => {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const fetched = querySnapshot.docs.map(doc => doc.data().name);
        setCategories(fetched);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        if(!categoryName) {
            alert('Kategori adı boş olamaz.');
            return;
        }
        
        try {
            await addDoc(collection(db, 'categories'), {
                name: categoryName 
            });
            alert('Kategori eklendi!');
            setCategoryName('');
            fetchCategories(); //Listeyi güncelliyoruz
            navigation.goBack();
        } catch (error) {
            console.error("Kategori eklenemedi: ", error);
            alert('Bir hata oluştu.');
        }
    };

    return (

        <View style={styles.container}>
            <ScrollView style={{ marginTop: 20 }}>
                <Text style={styles.title}>Kayıtlı Kategoriler:</Text>
                {categories.map((cat, index) => (
                    <Text key={index}> {cat}</Text>
                ))}
            </ScrollView>
            <TextInput
                label="Kategori Adı"
                value={categoryName}
                onChangeText={setCategoryName}
                style={styles.input}
            />
            <Button mode="contained" onPress={handleAddCategory}>
                Kategori Ekle
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
    title: {
        fontWeight: 'bold',
        marginBottom: 10,
        fontSize: 16,
    },
});

export default AddCategory;