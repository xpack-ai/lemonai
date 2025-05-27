<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? $t('setting.modelService.editModel') : $t('setting.modelService.addModel')"
    @ok="handleOk"
    @cancel="handleCancel"
    :maskClosable="false"
    :centered="true"
    :okText="$t('setting.modelService.confirm')"
    :cancelText="$t('setting.modelService.cancel')"
  >
    <div class="model-form">
      <a-form :model="formData" :rules="rules" ref="formRef">
        <a-form-item :label="$t('setting.modelService.modelId')" name="model_id" style="display: flex; justify-content: end">
          <a-input 
            v-model:value="formData.model_id" 
            :placeholder="$t('setting.modelService.modelIdPlaceholder')" 
            :disabled="isEdit"
          />
        </a-form-item>
        
        <a-form-item :label="$t('setting.modelService.modelName')" name="model_name">
          <a-input v-model:value="formData.model_name" :placeholder="$t('setting.modelService.modelNamePlaceholder')" />
        </a-form-item>

        <a-form-item :label="$t('setting.modelService.groupName')" name="group_name">
          <a-input v-model:value="formData.group_name" :placeholder="$t('setting.modelService.groupNamePlaceholder')" />
        </a-form-item>

        <a-form-item :label="$t('setting.modelService.modelTypes')" name="model_types">
          <a-checkbox-group v-model:value="formData.model_types" class="model_type_group">
            <a-checkbox class="checkbox-item" :value="t('setting.modelService.typeVision')">
              {{ $t('setting.modelService.typeVision') }}
            </a-checkbox>
            <a-checkbox class="checkbox-item" :value="t('setting.modelService.typeNetwork')">
              {{ $t('setting.modelService.typeNetwork') }}
            </a-checkbox>
            <a-checkbox class="checkbox-item" :value="t('setting.modelService.typeEmbed')">
              {{ $t('setting.modelService.typeEmbed') }}
            </a-checkbox>
            <a-checkbox class="checkbox-item" :value="t('setting.modelService.typeReasoning')">
              {{ $t('setting.modelService.typeReasoning') }}
            </a-checkbox>
            <a-checkbox class="checkbox-item" :value="t('setting.modelService.typeTool')">
              {{ $t('setting.modelService.typeTool') }}
            </a-checkbox>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, defineEmits, defineProps } from 'vue'
import { useI18n } from 'vue-i18n'
import service from '@/services/platforms'
import { message } from 'ant-design-vue'
import emitter from '@/utils/emitter'

const { t } = useI18n()
const visible = ref(false)
const formRef = ref(null)
const isEdit = ref(false)

const props = defineProps({
  platform_id: {
    type: Number,
    default: -1
  }
})

const formData = ref({
  model_id: '',
  model_name: '',
  group_name: '',
  model_types: [],
  platform_id: -1,
  logo_url: ''
})

const rules = {
  model_id: [
    { required: true, message: t('setting.modelService.enterModelId'), trigger: 'blur' }
  ],
  model_name: [
    { required: true, message: t('setting.modelService.enterModelName'), trigger: 'blur' }
  ],
  group_name: [
    { required: true, message: t('setting.modelService.enterGroupName'), trigger: 'blur' }
  ],
  model_types: [
    { required: true, type: 'array', message: t('setting.modelService.selectModelType'), trigger: 'change' }
  ]
}

const handleOk = async () => {
  try {
    // await formRef.value.validate()
    if (isEdit.value) {
      service.updateModel(formData.value).then((res) => {
        emitter.emit('fresh-models', true)
        message.success(t('setting.modelService.updateModelSuccess'))
      })
    } else {
      formData.value.platform_id = props.platform_id
      service.insertModel(formData.value).then((res) => {
        emitter.emit('fresh-models', res)
        message.success(t('setting.modelService.addModelSuccess'))
      })
    }
    visible.value = false
    resetForm()
  } catch (error) {
    console.error('Form validation failed:', error)
    message.error(t('setting.modelService.formValidationFailed'))
  }
}

const handleCancel = () => {
  visible.value = false
  resetForm()
}

const resetForm = () => {
  formData.value = {
    model_id: '',
    model_name: '',
    group_name: '',
    model_types: [],
    platform_id: props.platform_id,
    logo_url: ''
  }
  formRef.value?.resetFields()
}

const showModal = (model = null) => {
  if (model) {
    isEdit.value = true
    formData.value = {
      ...model,
      model_name: model.model_name || '',
      model_types: model.model_types || [],
      platform_id: model.platform_id || props.platform_id,
    }
  } else {
    isEdit.value = false
    resetForm()
  }
  visible.value = true
}

defineExpose({
  showModal
})
</script>

<style scoped>
.model-form {
  padding: 20px;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-checkbox-group) {
  display: flex;
  gap: 16px;
}

.model_type_group {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  /* flex-wrap: nowrap; */
}

.checkbox-item {
  margin: 0px;
  width: 20%;
}
.model_types{
  width: 100%;
  align-items: start;
}
</style>