<template>
    <div class="search-div">
        <!-- template部分修改内容 -->
        <!-- 搜索表单 -->
        <el-form label-width="70px" size="small">
            <el-form-item label="角色名称">
                <el-input
                        v-model="queryDto.roleName"
                        style="width: 100%"
                        placeholder="角色名称"
                        ></el-input> 
            </el-form-item>
            <el-row style="display:flex">
                <el-button type="primary" size="small" @click="searchSysRole">
                    搜索
                </el-button>
                <el-button size="small" @click="resetData">重置</el-button>
                
            </el-row>
        </el-form>

        <!-- 添加按钮 -->
        <div class="tools-div">
            <el-button type="success" size="small" @click="addShow">添 加</el-button>
        </div>

        <!-- 分配菜单的对话框 
        // tree组件添加ref属性，后期方便进行tree组件对象的获取
        -->
        <el-dialog v-model="dialogMenuVisible" title="分配菜单" width="40%">
            <el-form label-width="80px">
                <el-tree
                        :data="sysMenuTreeList"
                        ref="tree"   
                        show-checkbox
                        default-expand-all
                        :check-on-click-node="true"
                        node-key="id"
                        :props="defaultProps"
                />
                <el-form-item>
                    <el-button type="primary" @click="doAssign">提交</el-button>
                    <el-button @click="dialogMenuVisible = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

        <!-- 添加页面表单 -->
        <el-dialog v-model="dialogVisible" title="添加或修改角色" width="30%">
            <el-form label-width="120px">
                <el-form-item label="角色名称">
                    <el-input v-model="sysRole.roleName"/>
                </el-form-item>
                <el-form-item label="角色Code">
                    <el-input  v-model="sysRole.roleCode"/>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="submit">提交</el-button>
                    <el-button @click="dialogVisible = false">取消</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        
        <!--- 角色表格数据 -->
        <el-table :data="list" style="width: 100%">
            <el-table-column prop="roleName" label="角色名称" width="180" />
            <el-table-column prop="roleCode" label="角色code" width="180" />
            <el-table-column prop="createTime" label="创建时间" />
            <el-table-column label="操作" align="center" width="280" #default="scope">
                <el-button type="primary" size="small" @click="editShow(scope.row)">
                    修改
                </el-button>
                <el-button type="danger" size="small" @click="deleteById(scope.row)">
                    删除
                </el-button>
                <el-button type="warning" size="small" @click="showAssignMenu(scope.row)">
                    分配菜单
                </el-button>
            </el-table-column>
        </el-table>

        <!--分页条-->
        <el-pagination
                    v-model:current-page="pageParams.page"
                    v-model:page-size="pageParams.limit"
                    :page-sizes="[10, 20, 50, 100]"
                    @size-change="fetchData"
                    @current-change="fetchData"
                    layout="total, sizes, prev, pager, next"
                    :total="total"
        />
  </div>

</template>

<!-- script部分修改内容 -->
<script setup>
import { ref , onMounted } from 'vue';
import { GetSysRoleListByPage , SaveSysRole , UpdateSysRole , DeleteSysRoleById ,GetSysRoleMenuIds , DoAssignMenuIdToSysRole} from '@/api/sysRole';
import { ElMessage, ElMessageBox } from 'element-plus'

 ///////////////////////////////////为角色添加菜单
const doAssign = async () => {
    const checkedNodes = tree.value.getCheckedNodes() ; // 获取选中的节点
    const checkedNodesIds = checkedNodes.map(node => {  // 获取选中的节点的id
        return {
            id: node.id,
            isHalf: 0
        }
    })
        
    // 获取半选中的节点数据，当一个节点的子节点被部分选中时，该节点会呈现出半选中的状态
    const halfCheckedNodes = tree.value.getHalfCheckedNodes() ; 
    const halfCheckedNodesIds = halfCheckedNodes.map(node => {   // 获取半选中节点的id
        return {
            id: node.id,
            isHalf: 1
        }
    })
        
    // 将选中的节点id和半选中的节点的id进行合并
    const menuIds = [...checkedNodesIds , ...halfCheckedNodesIds]  
    console.log(menuIds);

    // 构建请求数据
    const assignMenuDto = {
        roleId: roleId,
        menuIdList: menuIds
    }
 
    // 发送请求
    await DoAssignMenuIdToSysRole(assignMenuDto) ;
    ElMessage.success('操作成功')
    dialogMenuVisible.value = false

} 


const defaultProps = {
  children: 'children',
  label: 'title',
}
const dialogMenuVisible = ref(false)
const sysMenuTreeList = ref([])

// 树对象变量
const tree = ref() 

// 默认选中的菜单数据集合
let roleId = ref()
const showAssignMenu = async row => { 
  dialogMenuVisible.value = true
  roleId = row.id
  const { data } = await GetSysRoleMenuIds(row.id)   // 请求后端地址获取所有的菜单数据，以及当前角色所对应的菜单数据
  sysMenuTreeList.value = data.sysMenuList
  tree.value.setCheckedKeys(data.roleMenuIds)   // 进行数据回显
}



//////////////////////////角色添加
//表单数据模型
const roleForm = {
    id: "",
    roleCode: "",
    roleName: ""
}

const sysRole = ref(roleForm) 

// 弹框设置 true弹出框
const dialogVisible = ref(false)

//进入添加弹出框
const addShow = () => {
    sysRole.value = {}
  	dialogVisible.value = true
}

// 添加角色
const submit = async () => {
    if(!sysRole.value.id) {
        const { code } = await SaveSysRole(sysRole.value) ;
        if(code === 200) {
            dialogVisible.value = false
            ElMessage.success('操作成功')
            fetchData()
        }
    }else {
        const { code } = await UpdateSysRole(sysRole.value) ;
        if(code === 200) {
            dialogVisible.value = false
            ElMessage.success('操作成功')
            fetchData()
        }
    }
}

// 修改按钮点击事件处理函数
const editShow = (row) => {
        //对象拓展运算符
        sysRole.value = {...row}
        // sysRole.value = row
        dialogVisible.value = true
    }

// 删除数据
const deleteById = (row) => {
    ElMessageBox.confirm('此操作将永久删除该记录, 是否继续?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
       const {code } = await DeleteSysRoleById(row.id)
       if(code === 200) {
            ElMessage.success('删除成功')
            pageParams.value.page = 1
            fetchData()
       }
    })
}
//////////////////////////角色列表
// 分页条总记录数
let total = ref(0)

// 定义表格数据模型（角色列表）
let list = ref([])

//分页数据
const pageParamsForm = {
  page: 1, // 页码
  limit: 10, // 每页记录数
}
const pageParams = ref(pageParamsForm)     // 将pageParamsForm包装成支持响应式的对象

// 搜索表单数据
const queryDto = ref({"roleName": ""})//条件封装数据

// 页面加载完毕以后请求后端接口获取数据
onMounted(() => {
    fetchData() ;
})

// 搜索按钮点击事件处理函数
const searchSysRole = () => {
    //queryDto.value.roleName = ""
    fetchData() ;
}

// 远程调用后端分页查询接口
const fetchData = async () => {
    const {data , code , message } = await GetSysRoleListByPage(pageParams.value.page , pageParams.value.limit , queryDto.value) ;
    list.value = data.list ;
    total.value = data.total
}

// 重置表单数据
const resetData = () => {
    queryDto.value.roleName = "" // 将搜索框中的角色名称清空
    fetchData() // 重新请求数据
}


</script>

<style scoped>

.search-div {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}

.tools-div {
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 3px;
  background-color: #fff;
}

</style>