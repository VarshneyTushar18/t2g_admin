import { useState, useEffect } from "react";
import {
    getCategories,
    getSubcategories,
    getProjects,
} from "../services/portfolioService";

export function useCategories() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reload = async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { reload(); }, []);
    return { items, loading, error, reload };
}

export function useSubcategories(categoryId) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reload = async () => {
        if (!categoryId) { setItems([]); setLoading(false); return; }
        try {
            setLoading(true);
            const data = await getSubcategories(categoryId);
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { reload(); }, [categoryId]);
    return { items, loading, error, reload };
}

export function useProjects(subcategoryId) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const reload = async () => {
        if (!subcategoryId) { setItems([]); setLoading(false); return; }
        try {
            setLoading(true);
            const data = await getProjects(subcategoryId);
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { reload(); }, [subcategoryId]);
    return { items, loading, error, reload };
}