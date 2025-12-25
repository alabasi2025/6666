                      placeholder="مثال: ST-001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">نوع المحطة *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: Station["type"]) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="generation">توليد</SelectItem>
                        <SelectItem value="distribution">توزيع</SelectItem>
                        <SelectItem value="generation_distribution">توليد وتوزيع</SelectItem>
                        <SelectItem value="solar">طاقة شمسية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nameAr">الاسم بالعربي *</Label>
                    <Input
                      id="nameAr"
                      placeholder="اسم المحطة بالعربي"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameEn">الاسم بالإنجليزي</Label>
                    <Input
                      id="nameEn"
                      placeholder="Station Name in English"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* المواصفات الفنية */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">المواصفات الفنية</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">الحالة</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Station["status"]) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operational">تعمل</SelectItem>
                        <SelectItem value="maintenance">صيانة</SelectItem>
                        <SelectItem value="offline">متوقفة</SelectItem>
                        <SelectItem value="construction">قيد الإنشاء</SelectItem>
                        <SelectItem value="decommissioned">خارج الخدمة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">السعة</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="100"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacityUnit">وحدة السعة</Label>
                    <Select
                      value={formData.capacityUnit}
                      onValueChange={(value) => setFormData({ ...formData, capacityUnit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MW">ميجاواط (MW)</SelectItem>
                        <SelectItem value="KW">كيلوواط (KW)</SelectItem>
                        <SelectItem value="GW">جيجاواط (GW)</SelectItem>
                        <SelectItem value="MVA">ميجا فولت أمبير (MVA)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voltageLevel">مستوى الجهد</Label>
                  <Input
                    id="voltageLevel"
                    placeholder="مثال: 132 KV"
                    value={formData.voltageLevel}
                    onChange={(e) => setFormData({ ...formData, voltageLevel: e.target.value })}
                  />
                </div>
              </div>

              {/* الموقع */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">الموقع</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Textarea
                    id="address"
                    placeholder="عنوان المحطة"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">خط العرض</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.00000001"
                      placeholder="24.7136"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">خط الطول</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.00000001"
                      placeholder="46.6753"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  resetForm();
                }}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingStation ? "تحديث المحطة" : "إضافة المحطة"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Radio className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المحطات</p>
              <p className="text-2xl font-bold">{stations?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">المحطات العاملة</p>
              <p className="text-2xl font-bold">{stations?.filter((s) => s.status === "operational").length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Settings className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">تحت الصيانة</p>
              <p className="text-2xl font-bold">{stations?.filter((s) => s.status === "maintenance").length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي السعة</p>
              <p className="text-2xl font-bold">
                {stations?.reduce((sum, s) => sum + (parseFloat(s.capacity || "0") || 0), 0).toFixed(0) || 0} MW
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المحطات</CardTitle>
          <CardDescription>جميع المحطات المسجلة في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو الكود..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="جميع الفروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفروع</SelectItem>
                {branches?.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.nameAr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : filteredStations && filteredStations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الكود</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الفرع</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>السعة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-mono">{station.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{station.nameAr}</p>
                        {station.nameEn && (
                          <p className="text-sm text-muted-foreground">{station.nameEn}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getBranchName(station.branchId)}</TableCell>
                    <TableCell>{getTypeLabel(station.type)}</TableCell>
                    <TableCell>
                      {station.capacity ? `${station.capacity} ${(station as any).capacityUnit || "MW"}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(station.status)}>{getStatusLabel(station.status)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(station as any)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(station.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Radio className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد محطات مسجلة</p>
              <Button variant="outline" className="mt-4 gap-2" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                إضافة أول محطة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
