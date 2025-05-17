import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox } from "expo-checkbox";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";

interface Todo {
  id: number;
  title: string;
  isDone: boolean;
}

export default function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoText, setTodoText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTodos = todos.filter((todo) =>
    todo.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const saved = await AsyncStorage.getItem("my-todo");
        if (saved) setTodos(JSON.parse(saved));
      } catch (e) {
        console.log("Failed to load todos", e);
      }
    };
    loadTodos();
  }, []);

  const saveTodos = async (newTodos: Todo[]) => {
    try {
      await AsyncStorage.setItem("my-todo", JSON.stringify(newTodos));
    } catch (e) {
      console.log("Failed to save todos", e);
    }
  };

  const addTodo = () => {
    if (!todoText.trim()) return;
    const newTodo: Todo = {
      id: Date.now(),
      title: todoText,
      isDone: false,
    };
    const updated = [newTodo, ...todos];
    setTodos(updated);
    saveTodos(updated);
    setTodoText("");
  };

  const toggleTodo = (id: number) => {
    const updated = todos.map((todo) =>
      todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
    );
    setTodos(updated);
    saveTodos(updated);
  };

  const deleteTodo = (id: number) => {
    const updated = todos.filter((todo) => todo.id !== id);
    setTodos(updated);
    saveTodos(updated);
  };

  const RenderItem = ({
    item,
    onDelete,
  }: {
    item: Todo;
    onDelete: (id: number) => void;
  }) => {
    const confirmDelete = () => {
      Alert.alert(
        "Delete Todo",
        `Are you sure you want to delete "${item.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            onPress: () => onDelete(item.id),
            style: "destructive",
          },
        ]
      );
    };
    return (
      <ScaleDecorator activeScale={1.06}>
        <View style={styles.todoList}>
          <Checkbox
            value={item.isDone}
            color={item.isDone ? "#4630EB" : undefined}
            onValueChange={() => toggleTodo(item.id)}
          />
          <Text
            style={[
              styles.todoText,
              item.isDone && {
                opacity: 0.5,
                textDecorationLine: "line-through",
                color: "#999",
              },
            ]}
          >
            {item.title}
          </Text>
          <TouchableOpacity onPress={confirmDelete}>
            <Ionicons size={24} name="trash" color={"red"} />
          </TouchableOpacity>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            alert("clicked Menu icon");
          }}
        >
          <Ionicons name="menu" size={24} style={{ color: "#333" }} />
        </TouchableOpacity>
        <Text>Todo App</Text>
        <TouchableOpacity
          onPress={() => {
            alert("Clicked Avatar");
          }}
        >
          <Image
            source={{ uri: "https://xsgames.co/randomusers/avatar.php?g=male" }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
      {/* todo section */}
      <View style={styles.todoContainer}>
        {/* search component */}
        <View style={styles.searchBar}>
          <Ionicons size={24} name="search" style={{ color: "#333" }} />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            editable={true}
            clearButtonMode="always"
            onChangeText={setSearchQuery}
          />
        </View>
        {/* todo list */}
        {filteredTodos.length > 0 ? (
          <DraggableFlatList
            data={filteredTodos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, drag }) => (
              <TouchableOpacity onLongPress={drag} activeOpacity={1} style={{paddingHorizontal: 10}}>
                <RenderItem item={item} onDelete={deleteTodo} />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            onDragEnd={({ data }) => {
              setTodos(data);
              saveTodos(data);
            }}
          />
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: "#999",
              }}
            >
              {searchQuery
                ? "Hmm… nothing found. Try another keyword?"
                : "No tasks yet. Add your first todo!"}
            </Text>
          </View>
        )}
      </View>
      <KeyboardAvoidingView
        style={styles.footer}
        behavior="padding"
        keyboardVerticalOffset={10}
      >
        <TextInput
          placeholder="Add new Todo"
          style={styles.newTodoInput}
          value={todoText}
          onChangeText={(text) => setTodoText(text)}
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addTodo}>
          <Ionicons name="add" size={34} color={"#FFF"} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  todoContainer: {
    gap: 20,
    flex: 1,
  },
  searchBar: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    padding: 16,
    borderRadius: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  todoList: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
  },
  todoText: { flex: 1, fontSize: 16, color: "#333" },
  footer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  newTodoInput: {
    padding: 16,
    flex: 1,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FFF",
    borderRadius: 6,
  },
  addBtn: { backgroundColor: "#4630EB", padding: 8, borderRadius: 6 },
});
