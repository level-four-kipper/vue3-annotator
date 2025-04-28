// 更改elementPlusConfig组件的默认配置
import { ElDialog, ElInput } from 'element-plus'

ElDialog.props.appendToBody.default = true
ElDialog.props.destroyOnClose.default = true
ElDialog.props.draggable.default = true
ElDialog.props.closeOnClickModal.default = false
ElDialog.props.closeOnPressEscape.default = false

ElInput.props.placeholder.default = '请输入'
