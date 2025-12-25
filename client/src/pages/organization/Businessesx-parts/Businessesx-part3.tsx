                        {business.phone || "-"}
                      </TableCell>
                      <TableCell dir="ltr" className="text-right">
                        {business.email || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={business.isActive ? "default" : "secondary"}>
                          {business.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleView(business)} title="عرض">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(business)} title="تعديل">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(business.id)} title="حذف">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              تعديل الشركة
            </DialogTitle>
            <DialogDescription>
              تعديل بيانات الشركة
            </DialogDescription>
          </DialogHeader>
          
          {editingBusiness && (
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">المعلومات الأساسية</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">كود الشركة</Label>
                    <Input
                      id="edit-code"
                      value={editingBusiness.code}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, code: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">نوع الشركة</Label>
                    <Select
                      value={editingBusiness.type}
                      onValueChange={(value: "holding" | "subsidiary" | "branch") => 
                        setEditingBusiness({ ...editingBusiness, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="holding">شركة قابضة</SelectItem>
                        <SelectItem value="subsidiary">شركة تابعة</SelectItem>
                        <SelectItem value="branch">فرع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-nameAr">الاسم بالعربي</Label>
                    <Input
                      id="edit-nameAr"
                      value={editingBusiness.nameAr}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, nameAr: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-nameEn">الاسم بالإنجليزي</Label>
                    <Input
                      id="edit-nameEn"
                      value={editingBusiness.nameEn || ""}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, nameEn: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>الأنظمة المتاحة</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* نظام الطاقة */}
                    <div 
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        editingBusiness.systemType === 'energy' || editingBusiness.systemType === 'both'
                          ? 'border-yellow-500 bg-yellow-500/10' 
                          : 'border-muted hover:border-yellow-500/50'
                      }`}
                      onClick={() => {
                        const hasEnergy = editingBusiness.systemType === 'energy' || editingBusiness.systemType === 'both';
                        const hasCustom = editingBusiness.systemType === 'custom' || editingBusiness.systemType === 'both';
                        const newHasEnergy = !hasEnergy;
                        let newType: 'energy' | 'custom' | 'both' = 'both';
                        if (newHasEnergy && hasCustom) newType = 'both';
                        else if (newHasEnergy) newType = 'energy';
                        else if (hasCustom) newType = 'custom';
                        else newType = 'both';
                        setEditingBusiness({ ...editingBusiness, systemType: newType });
                      }}
                    >
                      <Checkbox 
                        checked={editingBusiness.systemType === 'energy' || editingBusiness.systemType === 'both'}
                        className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                      />
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">نظام الطاقة</span>
                      </div>
                    </div>

                    {/* النظام المخصص */}
                    <div 
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        editingBusiness.systemType === 'custom' || editingBusiness.systemType === 'both'
                          ? 'border-amber-500 bg-amber-500/10' 
                          : 'border-muted hover:border-amber-500/50'
                      }`}
                      onClick={() => {
                        const hasEnergy = editingBusiness.systemType === 'energy' || editingBusiness.systemType === 'both';
                        const hasCustom = editingBusiness.systemType === 'custom' || editingBusiness.systemType === 'both';
                        const newHasCustom = !hasCustom;
                        let newType: 'energy' | 'custom' | 'both' = 'both';
                        if (hasEnergy && newHasCustom) newType = 'both';
                        else if (hasEnergy) newType = 'energy';
                        else if (newHasCustom) newType = 'custom';
                        else newType = 'both';
                        setEditingBusiness({ ...editingBusiness, systemType: newType });
                      }}
                    >
                      <Checkbox 
                        checked={editingBusiness.systemType === 'custom' || editingBusiness.systemType === 'both'}
                        className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <span className="font-medium">النظام المخصص</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">معلومات الاتصال</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">الهاتف</Label>
                    <Input
                      id="edit-phone"
                      value={editingBusiness.phone || ""}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, phone: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingBusiness.email || ""}
                      onChange={(e) => setEditingBusiness({ ...editingBusiness, email: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-address">العنوان</Label>
                  <Textarea
                    id="edit-address"
                    value={editingBusiness.address || ""}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">الحالة</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={editingBusiness.isActive}
                    onChange={(e) => setEditingBusiness({ ...editingBusiness, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="edit-isActive">الشركة نشطة</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              عرض بيانات الشركة
            </DialogTitle>
          </DialogHeader>
          
          {viewingBusiness && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">المعلومات الأساسية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">كود الشركة</Label>
                    <p className="font-medium">{viewingBusiness.code}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">نوع الشركة</Label>
                    <p className="font-medium">{getTypeLabel(viewingBusiness.type)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الاسم بالعربي</Label>
                    <p className="font-medium">{viewingBusiness.nameAr}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">الاسم بالإنجليزي</Label>
                    <p className="font-medium">{viewingBusiness.nameEn || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">نوع النظام</Label>
                    <p className="font-medium">{getSystemTypeLabel(viewingBusiness.systemType || "both")}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">العملة</Label>
                    <p className="font-medium">{viewingBusiness.currency}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">معلومات الاتصال</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">الهاتف</Label>
                    <p className="font-medium">{viewingBusiness.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                    <p className="font-medium">{viewingBusiness.email || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">العنوان</Label>
                    <p className="font-medium">{viewingBusiness.address || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground border-b pb-2">الحالة</h3>
                <Badge variant={viewingBusiness.isActive ? "default" : "secondary"}>
                  {viewingBusiness.isActive ? "نشط" : "غير نشط"}
                </Badge>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  إغلاق
                </Button>
                <Button onClick={() => { setIsViewDialogOpen(false); handleEdit(viewingBusiness); }}>
                  تعديل
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
