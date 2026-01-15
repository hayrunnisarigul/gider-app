// navigation/AppNavigator.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from '../screens/Home';
import ExpenseAdd from '../screens/ExpenseAdd';
import AddCategory from '../screens/AddCategory';
import AllExpense from '../screens/AllExpense';
import ExpenseEdit from '../screens/ExpenseEdit';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={Home} options={{ title: 'AnaSayfa' }} />
                <Stack.Screen name="ExpenseAdd" component={ExpenseAdd} options={{ title: 'Gider Ekle' }} />
                <Stack.Screen name="AddCategory" component={AddCategory} options={{ title: 'Kategori Ekle' }} />
                <Stack.Screen name="AllExpense" component={AllExpense} options={{ title: 'Tüm Giderler' }} />
                <Stack.Screen name="ExpenseEdit" component={ExpenseEdit} options={{ title: 'Gideri Güncelle' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;