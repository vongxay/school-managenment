<script setup lang="ts">
import { ref, onMounted, watch, computed } from "@vue/runtime-dom";
import Chart from "chart.js/auto";
import { useStudentStore } from "../stores/studentStore";
import {
  getMoneyByYearReportsByYear,
  getMoneyByYearReportsByYearMoney,
} from "../api/reports";
import axios from "axios";

// Get stores
const studentStore = useStudentStore();

const API_URL = "http://localhost:5000/api";
const classes = ref(0);
const unpaidTotalAmount = ref(0);
const unpaidTotalNumber = ref(0);
const yearlyAttendanceData = ref<number[]>([]);
const yearlyPaymentData = ref<Number[]>([]);
const years = ref<string[]>([]);
// Toggle between monthly and yearly views
const viewMode = ref<"monthly" | "yearly">("monthly");
const grachData = ref<
  {
    number: number;
    amount: string;
    level_name: string;
    school_year_name: string;
  }[]
>([]);

// Calculate stats from real data
const stats = computed(() => {
  const students = studentStore.students;
  return {
    totalStudents: students.length,
    maleStudents: students.filter((s) => s.gender === "M").length,
    femaleStudents: students.filter((s) => s.gender === "F").length,
  };
});

const fetchYears = async () => {
  try {
    const response = await axios.get(`${API_URL}/years`);
    if (response.data.success) {
      const currentYear = response.data.data.find(
        (y: any) => y.is_current === 1
      );
      return currentYear ? currentYear.id : null;
    }
  } catch (error) {
    console.error("Error fetching school years:", error);
    return null;
  }
};

const fetchReportData = async () => {
  try {
    const params: { [key: string]: any } = {};
    params.year_id = await fetchYears();
    params.level_id = "";
    const response = await getMoneyByYearReportsByYear(params);
    if (response.success) {
      let totalAmount = 0;
      let totalNumber = 0;
      grachData.value = response.data.studentsByYear;
      console.log("Years data123:", grachData.value);
      response.data.studentsByYear.forEach((item: any) => {
        totalAmount += parseFloat(item.amount);
        totalNumber += item.number;
      });
      unpaidTotalAmount.value = totalAmount;
      unpaidTotalNumber.value = totalNumber;
    }
  } catch (error) {
    console.error("ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານ:", error);
  }
};

const fetchReportDataGraph = async () => {
  try {
    // ສ້າງ params ແລະກອງເອົາຄ່າ null ອອກ
    const params: { [key: string]: any } = {};

    params.year_id = "";
    params.level_id = "";
    const response = await getMoneyByYearReportsByYearMoney(params);
    console.log("response||123:", response.data.studentsByYear);
    if (response.success) {
      // Assign API data to chart data refs
      years.value = response.data.studentsByYear.levels;
      yearlyAttendanceData.value = response.data.studentsByYear.numbers;
      yearlyPaymentData.value =
        response.data.studentsByYear.amounts.map(Number);
      console.log("years:", years.value);
      console.log("yearlyAttendanceData:", yearlyAttendanceData.value);
      console.log("yearlyPaymentData:", yearlyPaymentData.value);
      updateCharts(); // Update charts with new data
    }
  } catch (error) {
    console.error("ຂໍ້ຜິດພາດໃນການດຶງຂໍ້ມູນລາຍງານ:", error);
  }
};
// Yearly attendance data for the chart

let attendanceChart: Chart;
let paymentChart: Chart;

// Helper function to get current data based on view mode
const fetchClasses = async () => {
  try {
    const response = await axios.get(`${API_URL}/classes`);
    if (response.data.success) {
      Object.assign(classes, response.data.data);
      classes.value = response.data.data.length;
    }
  } catch (error) {
    console.error("Error fetching classes:", error);
  }
};

// Function to initialize or update the charts
const updateCharts = () => {
  // Update or create attendance chart
  const attendanceCtx = document.getElementById(
    "attendanceChart"
  ) as HTMLCanvasElement;
  if (attendanceCtx) {
    // Always recalculate sumAttendance with the latest data
    const sumAttendance = yearlyAttendanceData.value.reduce(
      (acc, val) => acc + Number(val),
      0
    );
    if (attendanceChart) {
      attendanceChart.data.labels = years.value;
      attendanceChart.data.datasets[0].data = yearlyAttendanceData.value;
      // Update the label as well!
      attendanceChart.data.datasets[0].label = `ຈຳນວນ ${sumAttendance} (ຄົນ)`;
      attendanceChart.update();
    } else {
      attendanceChart = new Chart(attendanceCtx, {
        type: "line",
        data: {
          labels: years.value,
          datasets: [
            {
              label: `ຈຳນວນ ${sumAttendance} (ຄົນ)`,
              data: yearlyAttendanceData.value,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
          ],
        },
        // ...options unchanged...
      });
    }
  }

  // Update or create payment chart
  const paymentCtx = document.getElementById(
    "paymentChart"
  ) as HTMLCanvasElement;
  if (paymentCtx) {
    const sumAttendance = yearlyPaymentData.value
      .map(Number)
      .reduce((acc, val) => acc + val, 0);

    if (paymentChart) {
      paymentChart.data.labels = years.value;
      paymentChart.data.datasets[0].data = yearlyPaymentData.value.map(Number);
      // Update the label as well!
      paymentChart.data.datasets[0].label = `${sumAttendance.toLocaleString()} (ກີບ)`;
      paymentChart.update();
    } else {
      paymentChart = new Chart(paymentCtx, {
        type: "bar",
        data: {
          labels: years.value,
          datasets: [
            {
              label: `${sumAttendance.toLocaleString()} (ກີບ)`,
              data: yearlyPaymentData.value.map(Number),
              backgroundColor: "rgba(16, 185, 129, 0.7)",
              borderColor: "rgb(16, 185, 129)",
              borderWidth: 1,
            },
          ],
        },
        // ...options unchanged...
      });
    }
  }
};

// Watch for changes in viewMode
watch(viewMode, () => {
  updateCharts();
});

// Load data when component is mounted
onMounted(async () => {
  await Promise.all([studentStore.getAllStudents()]);
  updateCharts();
  fetchReportDataGraph();
  fetchClasses();
  fetchReportData();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-blue-500"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">ນັກຮຽນທັງໝົດແລ້ວ</p>
            <p class="text-3xl font-bold text-blue-700">
              {{ stats.totalStudents }}
            </p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full text-blue-800 text-xl">
            👨‍🎓
          </div>
        </div>
        <div class="mt-4 text-sm">
          <span class="text-gray-600 flex items-center">
            <span
              class="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"
            ></span>
            ຊາຍ: {{ stats.maleStudents }}
          </span>
          <span class="text-gray-600 flex items-center">
            <span
              class="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"
            ></span>
            ຍິງ: {{ stats.femaleStudents }}
          </span>
        </div>
      </div>

      <div
        class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-green-500"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">ຈຳນວນຫ້ອງຮຽນທັງໝົດ</p>
            <p class="text-3xl font-bold text-green-700">
              {{ classes }}
            </p>
          </div>
          <div class="p-3 bg-green-100 rounded-full text-green-800 text-xl">
            🏫
          </div>
        </div>
        <div class="mt-4 text-sm">
          <span class="text-gray-600 flex items-center">
            <span
              class="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"
            ></span>
            ຈຳນວນທັງໝົດ ຊັ້ນ ມ.1 ເຖີງ ຊັ້ນ ມ.7
          </span>
        </div>
      </div>

      <div
        class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-red-500"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">ຄ່າຮຽນຈ່າຍທັງຫໝົດ</p>
            <p class="text-3xl font-bold text-red-700">
              {{ unpaidTotalAmount.toLocaleString() }} Lak
            </p>
          </div>
          <div class="p-3 bg-red-100 rounded-full text-red-800 text-xl">💰</div>
        </div>
        <div class="mt-4 text-sm">
          <span class="text-red-500 flex items-center">
            <span
              class="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"
            ></span>
            ນັກຮຽນທັງໝົດ:{{ unpaidTotalNumber }}
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">ຂໍ້ມູນນັກຮຽນ</h2>
        </div>
        <div class="h-64">
          <canvas id="attendanceChart"></canvas>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">ການຈ່າຍຄ່າຮຽນ</h2>
        </div>
        <div class="h-64">
          <canvas id="paymentChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
