import { FC, useCallback, useMemo, useState } from "react";
import { Button, ButtonGroup, Col, Container, Row } from "react-bootstrap";
import { format } from "date-fns";
import { CaretLeft, CaretRight } from "react-bootstrap-icons";
import "./calendar.scss";

const enum CalendarView {
  DAY,
  WEEK,
  MONTH,
  YEAR,
}

const CalendarComponent: FC = () => {
  const [view, setView] = useState<CalendarView>(CalendarView.DAY);
  const [dateValue, setDateValue] = useState<{
    dateString: string;
    date: Date;
  }>(() => {
    const date = new Date();
    return { date, dateString: format(date, "MMMM dd, yyyy") };
  });

  const swipe = useCallback(
    (mode: "left" | "right" | "today") => {
      const currentDate = new Date(dateValue.date.getTime());

      const today = new Date();

      switch (view) {
        case CalendarView.DAY:
          {
            if (mode === "today") {
              setDateValue({
                date: today,
                dateString: format(today, "MMMM dd, yyyy"),
              });
            } else {
              mode === "left"
                ? currentDate.setDate(currentDate.getDate() - 1)
                : currentDate.setDate(currentDate.getDate() + 1);
              setDateValue({
                date: currentDate,
                dateString: format(currentDate, "MMMM dd, yyyy"),
              });
            }
          }
          break;
        case CalendarView.WEEK:
          {
            if (mode === "today") {
              setDateValue({
                date: today,
                dateString: format(today, "MMMM, yyyy"),
              });
            } else {
              mode === "left"
                ? currentDate.setDate(currentDate.getDate() - 7)
                : currentDate.setDate(currentDate.getDate() + 7);
              setDateValue({
                date: currentDate,
                dateString: format(currentDate, "MMMM, yyyy"),
              });
            }
          }
          break;
        case CalendarView.MONTH:
          {
            if (mode === "today") {
              setDateValue({
                date: today,
                dateString: format(today, "MMMM, yyyy"),
              });
            } else {
              mode === "left"
                ? currentDate.setMonth(currentDate.getMonth() - 1)
                : currentDate.setMonth(currentDate.getMonth() + 1);
              setDateValue({
                date: currentDate,
                dateString: format(currentDate, "MMMM, yyyy"),
              });
            }
          }
          break;
        default:
          {
            if (mode === "today") {
              setDateValue({
                date: today,
                dateString: format(today, "yyyy"),
              });
            } else {
              mode === "left"
                ? currentDate.setFullYear(currentDate.getFullYear() - 1)
                : currentDate.setFullYear(currentDate.getFullYear() + 1);
              setDateValue({
                date: currentDate,
                dateString: format(currentDate, "yyyy"),
              });
            }
          }
          break;
      }
    },
    [dateValue, view],
  );

  console.log(dateValue);

  const noOfRows = useMemo<number[]>(() => {
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
    <Container fluid>
      <Row>
        <Col>
          <Button variant="light" onClick={() => swipe("today")}>
            Today
          </Button>
          <Button variant="light" onClick={() => swipe("left")}>
            <CaretLeft />
          </Button>
          <Button variant="light" onClick={() => swipe("right")}>
            <CaretRight />
          </Button>
        </Col>
        <Col>{dateValue.dateString}</Col>
        <Col>
          <ButtonGroup aria-label="Basic example">
            <Button variant="secondary" onClick={() => setView(CalendarView.DAY)}>
              Day
            </Button>
            <Button variant="secondary" onClick={() => setView(CalendarView.WEEK)}>
              Week
            </Button>
            <Button variant="secondary" onClick={() => setView(CalendarView.MONTH)}>
              Month
            </Button>
            <Button variant="secondary" onClick={() => setView(CalendarView.YEAR)}>
              Year
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
      {noOfRows.map((row, index) => {
        return (
          <Row className="timer" key={index}>
            <Col>{index + 1}</Col>
            <Col className="calendar-column"></Col>
          </Row>
        );
      })}
    </Container>
  );
};

export default CalendarComponent;
