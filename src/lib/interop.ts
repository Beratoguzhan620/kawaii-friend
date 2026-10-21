import { cssInterop } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";

// Lets the safe-area container take a className like any core component.
cssInterop(SafeAreaView, { className: "style" });
