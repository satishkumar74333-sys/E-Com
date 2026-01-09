import { createSlice } from "@reduxjs/toolkit";

const LOCAL_STORAGE_KEY = "CategoryList";

const initialState = {
  CategoryList: [
    { category: "Sofas", id: 1 },
    { category: "Coffee Tables", id: 2 },
    { category: "Beds", id: 3 },
    { category: "Wardrobes", id: 4 },
    { category: "  Nightstands", id: 5 },
    { category: "Outdoor Sofas", id: 6 },
    { category: "Office Chairs", id: 7 },
    { category: "Floor Lamps", id: 8 },
    { category: "Table Lamps", id: 9 },
    { category: "Kitchen Cabinets", id: 10 },
    { category: "Conference Tables", id: 11 },
    { category: "Filing Cabinets", id: 12 },
    { category: "Shelves", id: 13 },
    { category: "Office Desks", id: 14 },
    { category: "Sideboards", id: 15 },
    { category: "Bar Stools", id: 16 },
    { category: "Chairs", id: 17 },
    { category: "Buffet Tables", id: 18 },
    { category: "Dining Tables", id: 19 },
    { category: "Dresser", id: 20 },
  ],
};

const StoreCategoryListRedux = createSlice({
  name: "CategoryList",
  initialState,
  reducers: {
    addCategory: (state, action) => {
      const { category } = action.payload;

      if (!category) return;
      const isDuplicate = state.CategoryList.some(
        (item) => item.category === category
      );
      if (isDuplicate) return;

      state.CategoryList.push({
        category: category,
        id: Date.now(),
      });

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(state.CategoryList)
      );
    },

    deleteList: (state, action) => {
      const { id } = action.payload;

      state.CategoryList = state.CategoryList.filter((item) => item.id !== id);

      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(state.CategoryList)
      );
    },
  },
});

export const { addCategory, deleteList } = StoreCategoryListRedux.actions;
export default StoreCategoryListRedux.reducer;
