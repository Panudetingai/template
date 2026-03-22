import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function colorLanguage(language: string | null) {
  switch (language) {
    case "JavaScript":
      return "bg-yellow-500";
    case "TypeScript":
      return "bg-blue-500";
    case "Python":
      return "bg-green-500";
    case "Java":
      return "bg-red-500";
    case "C++":
      return "bg-purple-500";
    case "C#":
      return "bg-orange-500";
    case "Ruby":
      return "bg-pink-500";
    case "PHP":
      return "bg-purple-500";
    case "Swift":
      return "bg-teal-500";
    case "Kotlin":
      return "bg-indigo-500";
    case "HTML":
      return "bg-red-500";
    case "CSS":
      return "bg-blue-500";
    case "SQL":
      return "bg-green-500";
    case "Shell":
      return "bg-purple-500";
    case "PowerShell":
      return "bg-purple-500";
    case "Rust":
      return "bg-orange-500";
  }
  return "bg-gray-500";
}