import { FC, useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { BsCaretLeft, BsCaretRight } from "react-icons/bs";
import "./calendar.scss";

const enum CalendarView {
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

const CalendarComponent: FC = () => {
  const [view, setView] = useState<CalendarView>(CalendarView.DAY);
  const [dateValue, setDateValue] = useState(() => {
    const date = new Date();
    return { date, dateString: format(date, "MMMM dd, yyyy") };
  });

  const swipe = useCallback(
    (mode: "left" | "right" | "today") => {
      const currentDate = new Date(dateValue.date.getTime());
      const today = new Date();

      switch (view) {
        case CalendarView.DAY:
          mode === "today"
            ? setDateValue({ date: today, dateString: format(today, "MMMM dd, yyyy") })
            : setDateValue({
                date: new Date(currentDate.setDate(currentDate.getDate() + (mode === "left" ? -1 : 1))),
                dateString: format(currentDate, "MMMM dd, yyyy"),
              });
          break;
        case CalendarView.WEEK:
          mode === "today"
            ? setDateValue({ date: today, dateString: format(today, "MMMM, yyyy") })
            : setDateValue({
                date: new Date(currentDate.setDate(currentDate.getDate() + (mode === "left" ? -7 : 7))),
                dateString: format(currentDate, "MMMM, yyyy"),
              });
          break;
        case CalendarView.MONTH:
          mode === "today"
            ? setDateValue({ date: today, dateString: format(today, "MMMM, yyyy") })
            : setDateValue({
                date: new Date(currentDate.setMonth(currentDate.getMonth() + (mode === "left" ? -1 : 1))),
                dateString: format(currentDate, "MMMM, yyyy"),
              });
          break;
        default:
          mode === "today"
            ? setDateValue({ date: today, dateString: format(today, "yyyy") })
            : setDateValue({
                date: new Date(currentDate.setFullYear(currentDate.getFullYear() + (mode === "left" ? -1 : 1))),
                dateString: format(currentDate, "yyyy"),
              });
          break;
      }
    },
    [dateValue, view],
  );

  const noOfRows = useMemo(() => {
    switch (view) {
      case CalendarView.DAY:
      case CalendarView.WEEK:
        return Array.from(Array(12).keys());
      case CalendarView.MONTH:
        return Array.from(Array(5).keys());
      default:
        return Array.from(Array(4).keys());
    }
  }, [view]);

  return (
    <div className="calendarContainer">
      <div className="calendarContainerHeader">
        <button className="calendarContainerButton" onClick={() => swipe("today")}>Today</button>
        <button className="calendarContainerButton" onClick={() => swipe("left")}><BsCaretLeft /></button>
        <button className="calendarContainerButton" onClick={() => swipe("right")}><BsCaretRight /></button>
        <span className="calendarContainerDate">{dateValue.dateString}</span>
        <div className="calendarContainerViewSwitcher">
          <button className="calendarContainerButton" onClick={() => setView(CalendarView.DAY)}>Day</button>
          <button className="calendarContainerButton" onClick={() => setView(CalendarView.WEEK)}>Week</button>
          <button className="calendarContainerButton" onClick={() => setView(CalendarView.MONTH)}>Month</button>
          <button className="calendarContainerButton" onClick={() => setView(CalendarView.YEAR)}>Year</button>
        </div>
      </div>
      <div className="calendarContainerBody">
        {noOfRows.map((_, index) => (
          <div className="calendarContainerRow" key={index}>
            <span className="calendarContainerTime">{index + 1}</span>
            <div className="calendarContainerColumn"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarComponent;