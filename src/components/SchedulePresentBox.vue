<template>
  <q-chip
    size="12px"
    class="row items-center"
    :class="{
      'bg-blue-grey-7': schedule_type === 'D',
      'bg-blue-grey-5': schedule_type === 'W',
      'bg-blue-grey-4': schedule_type === 'M',
      'bg-deep-purple-3': schedule_type === 'C',
      'bg-deep-purple-2 text-grey-9': schedule_type === 'X',
    }"
    text-color="white"
    icon="alarm">
    {{ schedule_text }}
  </q-chip>
</template>

<script>
export default {
  props: ["schedule"],
  data() {
    return {
      schedule_object: {},
    };
  },
  computed: {
    schedule_type() {
      if (
        String(this.schedule).indexOf("/") > -1 ||
        String(this.schedule).indexOf("-") > -1 ||
        (String(this.schedule_object.hour) + String(this.schedule_object.min) + String(this.schedule_object.sec)).indexOf(",") > -1
      ) {
        return "X";
      } else if (this.schedule_object.hour == null && this.schedule_object.min == null && this.schedule_object.sec == null) {
        return "C";
      } else if (this.schedule_object.mday) {
        return "M";
      } else if (this.schedule_object.wday) {
        return "W";
      } else {
        return "D";
      }
    },
    schedule_time() {
      return (
        String(this.schedule_object.hour).padStart(2, "0") +
        ":" +
        String(this.schedule_object.min).padStart(2, "0") +
        ":" +
        String(this.schedule_object.sec).padStart(2, "0")
      );
    },
    schedule_text() {
      var run_on_string = [];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      if (this.schedule_type === "X") {
        const filteredSchedule = Object.fromEntries(Object.entries(JSON.parse(this.schedule)).filter(([, value]) => value !== null));
        return JSON.stringify(filteredSchedule);
      } else if (this.schedule_type === "C") {
        return "Cascade (@control_id=" + this.schedule_object.trigger_id + ")";
      } else if (this.schedule_type === "M") {
        for (const m of this.schedule_object.mday) {
          run_on_string.push(m);
        }
        return "Monthly (" + run_on_string.join(", ") + ") @ " + this.schedule_time;
      } else if (this.schedule_type === "W") {
        for (const m of this.schedule_object.wday) {
          run_on_string.push(days[m]);
        }
        return "Weekly (" + run_on_string.join(", ") + ") @ " + this.schedule_time;
      } else {
        return "Daily @ " + this.schedule_time;
      }
    },
  },
  mounted() {
    this.schedule_object = JSON.parse(this.schedule);

    if (this.schedule_object.mday) {
      this.schedule_object.mday = String(this.schedule_object.mday)
        .split(",")
        .map((i) => Number(i));
    }

    if (this.schedule_object.wday) {
      this.schedule_object.wday = String(this.schedule_object.wday)
        .split(",")
        .map((i) => Number(i));
    }
  },
};
</script>
