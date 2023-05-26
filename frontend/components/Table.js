import * as React from "react";
import Paper from "@material-ui/core/Paper";
import {
  ViewState,
  EditingState,
  IntegratedEditing,
} from "@devexpress/dx-react-scheduler";
import {
  Scheduler,
  DayView,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  DragDropProvider,
  EditRecurrenceMenu,
  ConfirmationDialog,
} from "@devexpress/dx-react-scheduler-material-ui";
import { createStandaloneToast } from "@chakra-ui/react";

// ======================== Function =========================

const messages = {
  moreInformationLabel: "",
};

const TextEditor = (props) => {
  // eslint-disable-next-line react/destructuring-assignment
  if (props.type === "multilineTextEditor") {
    return null;
  }
  return <AppointmentForm.TextEditor {...props} />;
};

const BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
  const onCustomFieldChange = (nextValue) => {
    onFieldChange({ customField: nextValue });
  };

  return (
    <AppointmentForm.BasicLayout
      appointmentData={appointmentData}
      onFieldChange={onFieldChange}
      {...restProps}
    >
      <AppointmentForm.Label text="Custom Field" type="title" />
      <AppointmentForm.TextEditor
        value={appointmentData.customField}
        onValueChange={onCustomFieldChange}
        placeholder="Custom field"
      />
    </AppointmentForm.BasicLayout>
  );
};

const toast = createStandaloneToast();
const runErrorToast = (msg) =>
  toast({
    title: "An error occurred.",
    description: `${msg}`,
    status: "error",
    duration: 1000,
    isClosable: true,
    position: "top",
  });
const runSuccessToast = (msg) =>
  toast({
    title: "Success!",
    description: `${msg}`,
    status: "success",
    duration: 1000,
    isClosable: true,
    position: "top",
  });
const dragDisableIds = new Set([]);

const sideAcitivity = (activity) => {
  const sideAcitivity = new Set([]);
  for (var i = 0; i < activity.length; i++) {
    if (activity[i].type == "side") {
      sideAcitivity.push(activity.id);
    }
  }
  return sideAcitivity;
};

const allowDrag = ({ id }) => !dragDisableIds.has(id);
const isSide = ({ id }) => sideAcitivity(id).has(id);

const appointmentComponent = (props) => {
  if (allowDrag(props.data)) {
    // TODO: change Side activity to yellow

    return <Appointments.Appointment {...props} />;
  }
  return (
    <Appointments.Appointment
      {...props}
      style={{ ...props.style, cursor: "not-allowed" }}
    />
  );
};

function get_date(group_id) {
  // TODO: connect to back-end API
  var str = group_id.slice(-10);
  const output = new Date(str);
  return output;
}

function get_schedule(raw_schedule, group_id) {
  var output = [];
  for (var i = 0; i < raw_schedule.length; i++) {
    const data = {
      title: raw_schedule[i].activity_name,
      startDate: new Date(
        group_id.slice(-10) + "T" + raw_schedule[i].start_time
      ),
      endDate: new Date(group_id.slice(-10) + "T" + raw_schedule[i].end_time),
      id: raw_schedule[i].activity_id,
      type: raw_schedule[i].type,
    };
    output.push(data);
  }

  return output;
}

const put_Request = async (putURL, reqOptions) => {
  let data = await fetch(putURL, reqOptions);
  if (data.status == 200) {
    runSuccessToast("Activity time has been updated");
  } else if (data.status == 400) {
    runErrorToast("Activities can not be overlaped.");
  } else if (data.status == 403) {
    runErrorToast("You must be a group owner to change schedule!");
  }
};

function change_schedule(session, changed, group_id) {
  for (const key of Object.keys(changed)) {
    var end =
      changed[key]["endDate"].getHours() +
      ":" +
      changed[key]["endDate"].getMinutes() +
      ":00";
    var start =
      changed[key]["startDate"].getHours() +
      ":" +
      changed[key]["startDate"].getMinutes() +
      ":00";
    // console.log("dsjsdkf" + session.accessToken);
    let putURL = "http://127.0.0.1:5000/schedule";
    var input = {
      group_id: group_id,
      activity_id: key,
      start_time: start,
      end_time: end,
      token: session.accessToken,
    };
    let reqOptions = {
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    };

    put_Request(putURL, reqOptions);
  }
}

function delete_schedule(session, deleted, group_id) {
  let para = "?activity_id=" + deleted + `&token=${session.accessToken}`;
  let deleteURL = "http://127.0.0.1:5000/schedule/" + group_id + para;
  let reqOptions = {
    method: "DELETE",
  };
  var data = fetch(deleteURL, reqOptions);
  if (data.status == 200) {
    runSuccessToast("Activity has been removed");
  } else if (data.status == 403) {
    runErrorToast("You must be a group owner to change schedule!");
  }
}

// ======================== Main =========================

export default class Schedule_Table extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      group_id: props.id,
      session: props.session,
      currentDate: get_date(props.id),
      data: get_schedule(props.raw_data, props.id),
      raw_data: props.raw_data,
    };
    this.onCommitChanges = this.onCommitChanges.bind(this);
  }

  onCommitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      let { data } = state;
      if (added) {
        const startingAddedId =
          data.length > 0 ? data[data.length - 1].id + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];
      }
      if (changed) {
        change_schedule(state.session, changed, state.group_id);
        data = data.map((appointment) =>
          changed[appointment.id]
            ? { ...appointment, ...changed[appointment.id] }
            : appointment
        );
      }
      if (deleted !== undefined) {
        delete_schedule(state.session, deleted, state.group_id);
        data = data.filter((appointment) => appointment.id !== deleted);
      }
      return { data };
    });
  }

  render() {
    const { group_id, raw_data, currentDate, data } = this.state;
    return (
      <Paper>
        <Scheduler data={data} height={750}>
          <ViewState defaultCurrentDate={currentDate} />
          <EditingState onCommitChanges={this.onCommitChanges} />
          <IntegratedEditing />
          <DayView startDayHour={6.5} endDayHour={21.5} />
          <Appointments appointmentComponent={appointmentComponent} />
          <AppointmentTooltip showOpenButton showDeleteButton />
          <ConfirmationDialog />
          <AppointmentForm
            basicLayoutComponent={BasicLayout}
            textEditorComponent={TextEditor}
            messages={messages}
          />
          <DragDropProvider allowDrag={allowDrag} />
        </Scheduler>
      </Paper>
    );
  }
}
