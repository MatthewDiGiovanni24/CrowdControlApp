import React, { createContext, useContext, useMemo, useState } from 'react';

export type CrowdLevel = 'Low' | 'Medium' | 'High';

export type Submission = {
  id: string;
  uid: string;
  username: string;
  location: string;
  level: CrowdLevel;
  createdAt: string;
};

type NewSubmission = Omit<Submission, 'id'>;

type SubmissionsContextType = {
  submissions: Submission[];
  addSubmission: (submission: NewSubmission) => void;
};

const SubmissionsContext = createContext<SubmissionsContextType | undefined>(undefined);

export function SubmissionsProvider({ children }: { children: React.ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const addSubmission = (submission: NewSubmission) => {
    const newSubmission: Submission = {
      id: Date.now().toString(),
      ...submission,
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
  };

  const value = useMemo(
    () => ({
      submissions,
      addSubmission,
    }),
    [submissions]
  );

  return <SubmissionsContext.Provider value={value}>{children}</SubmissionsContext.Provider>;
}

export function useSubmissions() {
  const context = useContext(SubmissionsContext);

  if (!context) {
    throw new Error('useSubmissions must be used within a SubmissionsProvider');
  }

  return context;
}