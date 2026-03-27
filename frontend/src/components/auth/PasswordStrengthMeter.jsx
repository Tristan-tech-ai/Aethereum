import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

const requirements = [
  { key: 'length', label: 'Minimal 8 karakter', test: (pw) => pw.length >= 8 },
  { key: 'upper', label: 'Huruf besar (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lower', label: 'Huruf kecil (a-z)', test: (pw) => /[a-z]/.test(pw) },
  { key: 'number', label: 'Angka (0-9)', test: (pw) => /\d/.test(pw) },
  { key: 'special', label: 'Karakter spesial (!@#$...)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const strengthLevels = [
  { label: 'Sangat Lemah', color: 'bg-danger', textColor: 'text-danger' },
  { label: 'Lemah', color: 'bg-danger', textColor: 'text-danger' },
  { label: 'Cukup', color: 'bg-warning', textColor: 'text-warning' },
  { label: 'Kuat', color: 'bg-success', textColor: 'text-success' },
  { label: 'Sangat Kuat', color: 'bg-success', textColor: 'text-success' },
];

const PasswordStrengthMeter = ({ password }) => {
  const { score, passed } = useMemo(() => {
    if (!password) return { score: 0, passed: {} };
    const p = {};
    let s = 0;
    for (const req of requirements) {
      const ok = req.test(password);
      p[req.key] = ok;
      if (ok) s++;
    }
    return { score: s, passed: p };
  }, [password]);

  if (!password) return null;

  const level = strengthLevels[Math.max(0, score - 1)] || strengthLevels[0];

  return (
    <div className="mt-2 space-y-2.5">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= score ? level.color : 'bg-border'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${level.textColor} min-w-[80px] text-right`}>
          {level.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center gap-1.5">
            {passed[req.key] ? (
              <Check size={12} className="text-success shrink-0" />
            ) : (
              <X size={12} className="text-text-muted shrink-0" />
            )}
            <span
              className={`text-[11px] leading-tight ${
                passed[req.key] ? 'text-success' : 'text-text-muted'
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
