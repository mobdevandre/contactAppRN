import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import * as SQLite from "expo-sqlite";

export default function App() {
  const [listContact, setListContact] = useState([]);
  const [textInputName, setTextInputName] = useState("");
  const [textInputNumber, setTextInputNumber] = useState("");
  const [updateActive, setUpdateActive] = useState(false);
  const [updateName, setUpdateName] = useState("");

  async function addNew() {
    // let newArray = listContact;
    // newArray.push(textInput);
    // setListContact(newArray);
    // console.log(newArray);
    if (textInputName == "" || textInputNumber == "") {
    } else {
      const db = await SQLite.openDatabaseAsync("databaseApp");

      await db.runAsync(
        "INSERT INTO contact (value, intValue) VALUES (?, ?)",
        textInputName,
        textInputNumber
      );

      getList();
      setTextInputName("");
      setTextInputNumber("");
    }
  }

  async function getList() {
    const db = await SQLite.openDatabaseAsync("databaseApp");

    const allRows = await db.getAllAsync("SELECT * FROM contact");
    let newArray = [];
    for (const row of allRows) {
      console.log(row.id, row.value, row.intValue);
      newArray.push({ name: row.value, number: row.intValue });
    }
    setListContact(newArray);
  }

  async function removeList(user) {
    const db = await SQLite.openDatabaseAsync("databaseApp");

    // console.log("Remove:" + user);
    await db.runAsync("DELETE FROM contact WHERE value = $value", {
      $value: user,
    });

    getList();
  }

  async function update(user, number) {
    setUpdateActive(true);
    setTextInputName(user);
    setTextInputNumber(number.toString());
    setUpdateName(user);
  }

  async function actionUpdate() {
    if (textInputName == "" || textInputNumber == "") {
    } else {
      const db = await SQLite.openDatabaseAsync("databaseApp");

      await db.runAsync(
        "UPDATE contact SET value = ?, intValue = ?  WHERE value = ?",
        textInputName,
        textInputNumber,
        updateName
      );

      getList();
      setTextInputName("");
      setTextInputNumber("");
      setUpdateActive(false);
    }
  }

  useEffect(() => {
    async function setup() {
      const db = await SQLite.openDatabaseAsync("databaseApp");

      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS contact (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL, intValue INTEGER);`);

      getList();
    }
    setup();
  }, []);
  return (
    <View style={styles.container}>
      <Text>Name</Text>
      <TextInput
        value={textInputName}
        style={styles.input}
        onChangeText={setTextInputName}
      ></TextInput>
      <Text>Number</Text>
      <TextInput
        value={textInputNumber}
        style={styles.input}
        onChangeText={setTextInputNumber}
      ></TextInput>
      {updateActive ? (
        <Button title="Update" onPress={() => actionUpdate()} />
      ) : (
        <Button title="Add" onPress={() => addNew()} />
      )}
      {listContact.map((item, index) => {
        return (
          <View key={index}>
            <Text>{item.name}</Text>
            <Text>{item.number}</Text>
            <Button title="Remove" onPress={() => removeList(item.name)} />
            <Button
              title="Update"
              onPress={() => update(item.name, item.number)}
            />
          </View>
        );
      })}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    height: 40,
    width: "80%",
    borderColor: "black",
    borderWidth: 1,
    padding: 10,
  },
});
