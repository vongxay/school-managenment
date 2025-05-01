<script setup lang="ts">
// ตัวอย่างการใช้ฟอนต์ภาษาลาว
</script>

<template>
  <div class="lao-font-demo p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-3xl font-bold mb-4 text-blue-600">ທົດສອບຟອນຕ໌ພາສາລາວ</h2>
    <p class="text-lg mb-4">
      ຂໍ້ຄວາມນີ້ໃຊ້ຟອນຕ໌ພາສາລາວ Saysettha ທີ່ສວຍງາມ ເຊິ່ງເປັນຟອນຕ໌ທີ່ໄດ້ຮັບຄວາມນິຍົມໃນ ສປປ ລາວ.
    </p>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div class="font-styles p-4 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-bold mb-3 text-blue-500">ຮູບແບບຂອງຟອນຕ໌:</h3>
        <p class="font-normal mb-2">ຕົວໜັງສືທົ່ວໄປ (Normal)</p>
        <p class="font-bold mb-2">ຕົວໜັງສືຕົວໜາ (Bold)</p>
        <p class="text-2xl mb-2">ຂະໜາດໃຫຍ່ (Large)</p>
        <p class="text-sm">ຂະໜາດນ້ອຍ (Small)</p>
      </div>
      
      <div class="sample-text p-4 bg-gray-50 rounded-lg">
        <h3 class="text-xl font-bold mb-3 text-blue-500">ຕົວຢ່າງປະໂຫຍກ:</h3>
        <p class="mb-2">ສວັດດີຊາວລາວທຸກທ່ານ!</p>
        <p class="mb-2">ໂຮງຮຽນ ສປປ ລາວ ຂໍຕ້ອນຮັບທ່ານ.</p>
        <p class="mb-2">ພາສາລາວແມ່ນພາສາທີ່ງົດງາມຫຼາຍ.</p>
        <p>ການສຶກສາແມ່ນກະແຈສຳຄັນໃນການພັດທະນາ.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lao-font-demo {
  font-family: var(--font-lao), system-ui, sans-serif;
}
</style> 