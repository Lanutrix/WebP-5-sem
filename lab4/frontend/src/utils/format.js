const rub = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

const dateTime = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMoney(value) {
  return rub.format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return "";
  // Сервер отдаёт UTC без суффикса Z — добавляем, чтобы браузер показал локальное время
  const iso = /Z|[+-]\d\d:\d\d$/.test(value) ? value : `${value}Z`;
  return dateTime.format(new Date(iso));
}

export function formatQty(value) {
  return Number(value).toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}

export const STATUS_LABELS = {
  new: "Новая",
  paid: "Оплачена",
  in_progress: "В работе",
  completed: "Выполнена",
  cancelled: "Отменена",
};

export const STATUS_ORDER = ["new", "paid", "in_progress", "completed"];

/** Допустимые переходы (зеркало серверной логики) */
export const NEXT_STATUSES = {
  new: [
    { value: "paid", label: "Отметить оплаченной" },
    { value: "cancelled", label: "Отменить" },
  ],
  paid: [
    { value: "in_progress", label: "Взять в работу" },
    { value: "cancelled", label: "Отменить" },
  ],
  in_progress: [
    { value: "completed", label: "Услуга оказана" },
    { value: "cancelled", label: "Отменить" },
  ],
  completed: [],
  cancelled: [],
};
