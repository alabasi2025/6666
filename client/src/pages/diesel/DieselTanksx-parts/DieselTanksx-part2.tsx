                              منخفض
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tank.isActive ? "default" : "secondary"}>
                          {tank.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openViewDialog(tank as any)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(tank as any)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tank.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog إضافة خزان */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة خزان جديد</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المحطة *</Label>
              <Select
                value={formData.stationId}
                onValueChange={(value) => setFormData({ ...formData, stationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المحطة" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station: any) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="TNK001"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالعربي *</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="خزان الاستلام الرئيسي"
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="Main Receiving Tank"
              />
            </div>
            <div className="space-y-2">
              <Label>نوع الخزان *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tankTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>السعة (لتر) *</Label>
              <Input
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="10000"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>المستوى الحالي (لتر)</Label>
              <Input
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                placeholder="0"
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى (لتر)</Label>
              <Input
                value={formData.minLevel}
                onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
                placeholder="1000"
                type="number"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending}>
              {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog تعديل خزان */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الخزان</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الكود *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالعربي *</Label>
              <Input
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>الاسم بالإنجليزي</Label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>نوع الخزان *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(tankTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>السعة (لتر) *</Label>
              <Input
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>المستوى الحالي (لتر)</Label>
              <Input
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى (لتر)</Label>
              <Input
                value={formData.minLevel}
                onChange={(e) => setFormData({ ...formData, minLevel: e.target.value })}
                type="number"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>نشط</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "جاري التحديث..." : "تحديث"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog عرض تفاصيل الخزان */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الخزان</DialogTitle>
          </DialogHeader>
          {selectedTank && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">الكود</p>
                  <p className="font-mono">{selectedTank.code}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p>{selectedTank.nameAr}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">النوع</p>
                  <Badge className={tankTypeColors[selectedTank.type]}>
                    {tankTypeLabels[selectedTank.type]}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <Badge variant={selectedTank.isActive ? "default" : "secondary"}>
                    {selectedTank.isActive ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-4">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">مستوى الخزان</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المستوى الحالي</span>
                    <span className="font-bold">
                      {parseFloat(selectedTank.currentLevel || "0").toLocaleString()} لتر
                    </span>
                  </div>
                  <Progress value={getLevelPercentage(selectedTank)} className="h-4" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>الحد الأدنى: {parseFloat(selectedTank.minLevel || "0").toLocaleString()} لتر</span>
                    <span>السعة: {parseFloat(selectedTank.capacity).toLocaleString()} لتر</span>
                  </div>
                  {isLowLevel(selectedTank) && (
                    <div className="flex items-center gap-2 text-red-500 mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>تحذير: مستوى الخزان منخفض!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              إغلاق
            </Button>
            <Button onClick={() => { setIsViewOpen(false); openEditDialog(selectedTank!); }}>
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
