<script setup lang="ts">
import { ref, onMounted, watch } from "@vue/runtime-dom";
import Chart from "chart.js/auto";

// Toggle between monthly and yearly views
const viewMode = ref<"monthly" | "yearly">("monthly");

// Mock statistics data
const stats = ref({
  totalStudents: 358,
  maleStudents: 210,
  femaleStudents: 148,
  totalClasses: 12,
  averageAttendance: 97.2,
  unpaidFees: 12500000,
});

// Yearly attendance data for the chart
const yearlyAttendanceData = ref([88, 86, 92, 81, 90]);
const yearlyPaymentData = ref([
  95000000, 102000000, 115000000, 125000000, 138000000,
]);
const years = ["2019", "2020", "2021", "2022", "2023"];

let attendanceChart: Chart;
let paymentChart: Chart;

// Helper function to get current data based on view mode
const getCurrentChartData = () => {
  return {
    labels: years,
    attendanceData: yearlyAttendanceData.value,
    paymentData: yearlyPaymentData.value,
  };
};

// Function to initialize or update the charts
const updateCharts = () => {
  const data = getCurrentChartData();

  // Update or create attendance chart
  const attendanceCtx = document.getElementById(
    "attendanceChart"
  ) as HTMLCanvasElement;
  if (attendanceCtx) {
    if (attendanceChart) {
      attendanceChart.data.labels = data.labels;
      attendanceChart.data.datasets[0].data = data.attendanceData;
      attendanceChart.update();
    } else {
      attendanceChart = new Chart(attendanceCtx, {
        type: "line",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: `ຈໍານອນ ${245} (ຄົນ)`,
              data: data.attendanceData,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderWidth: 2,
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            y: {
              min: 10,
              // max: 100,
              ticks: {
                callback: function (value) {
                  return value;
                },
              },
            },
          },
        },
      });
    }
  }

  // Update or create payment chart
  const paymentCtx = document.getElementById(
    "paymentChart"
  ) as HTMLCanvasElement;
  if (paymentCtx) {
    if (paymentChart) {
      paymentChart.data.labels = data.labels;
      paymentChart.data.datasets[0].data = data.paymentData;
      paymentChart.update();
    } else {
      paymentChart = new Chart(paymentCtx, {
        type: "bar",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: "11,200,000 (Kip)",
              data: data.paymentData,
              backgroundColor: "rgba(16, 185, 129, 0.7)",
              borderColor: "rgb(16, 185, 129)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            y: {
              ticks: {
                callback: function (value) {
                  return value.toLocaleString() + " ₭";
                },
              },
            },
          },
        },
      });
    }
  }
};

// Watch for changes in viewMode
watch(viewMode, () => {
  updateCharts();
});

onMounted(() => {
  updateCharts();
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
            <p class="text-sm font-medium text-gray-500">ນັກຮຽນທັງໝົດ</p>
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
          <span class="text-gray-600 ml-4 flex items-center">
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
            <p class="text-sm font-medium text-gray-500">ຈຳນວນຫ້ອງຮຽນ</p>
            <p class="text-3xl font-bold text-green-700">
              {{ stats.totalClasses }}
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
            ອັດຕາການມາຮຽນ: {{ stats.averageAttendance }}%
          </span>
        </div>
      </div>

      <div
        class="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border-l-4 border-red-500"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">ຄ່າຮຽນຍັງບໍ່ທັນຈ່າຍ</p>
            <p class="text-3xl font-bold text-red-700">
              {{ stats.unpaidFees.toLocaleString() }} ₭
            </p>
          </div>
          <div class="p-3 bg-red-100 rounded-full text-red-800 text-xl">💰</div>
        </div>
        <div class="mt-4 text-sm">
          <span class="text-red-500 flex items-center">
            <span
              class="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"
            ></span>
            ຕ້ອງໄດ້ຮັບຊຳລະພາຍໃນເດືອນນີ້
          </span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">ອັດຕາການເຂົ້າຮຽນຂອງນັກຮຽນ</h2>
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
