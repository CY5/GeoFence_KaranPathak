fitx.utils.require(['fitx', 'page2', 'rbacAuth']);

jQuery(window).load(function () {
    setupAJAXSubmit('rbacAuth', 'rbacAuthAction', setupData, setupConstraints,'#save')
    jQuery('#cancel').click(function(){
         fitx.page2.closeActiveTab()
    })
})

function setupData() {
    var specificFormData = {}
    specificFormData.Roles=[]
    jQuery('.row').each(function(){
        role ={}
        row=jQuery(this)

        role.name=row.children('.role').data('rolename')
        role.description=row.children('.role').text()

        role.users=[]

        row.children('.users').find("input:checked").each(function () {
            role.users.push(jQuery(this).val());
        })

        role.permissions=[]
        row.children('.permissions').find("input:checked").each(function () {
            role.permissions.push(jQuery(this).val());
        })
     specificFormData.Roles.push(role)
    })
    return specificFormData
}

function setupConstraints() {
    var specificFormConstraints={}
    return specificFormConstraints
}