import { useCallback, useEffect, useState } from "react";
import { getLeadStats } from "../services/leadService";

const EMPTY = {
  totals: {
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    uniqueCompanies: 0,
    uniqueCountries: 0,
  },
  bySourceSite: [],
  byFormType: [],
  byCompany: [],
  byCountry: [],
  byDay: [],
  byMonth: [],
  bySourcePage: [],
  recentLeads: [],
  insights: {},
};

export function useLeadStats() {
  const [stats, setStats] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formType, setFormType] = useState("");
  const [sourceSite, setSourceSite] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLeadStats({
        form_type: formType,
        source_site: sourceSite,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setStats(res.data || EMPTY);
    } catch (err) {
      setError(err.message || "Failed to load stats");
      setStats(EMPTY);
    } finally {
      setLoading(false);
    }
  }, [formType, sourceSite, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    stats,
    loading,
    error,
    formType,
    setFormType,
    sourceSite,
    setSourceSite,
    dateFrom,
    dateTo,
    changeDateRange: (from, to) => {
      setDateFrom(from);
      setDateTo(to);
    },
    reload: load,
  };
}
