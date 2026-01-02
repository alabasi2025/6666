          </div>
        </CardContent>
      </Card>

      {/* Operations List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة العمليات ({filteredOperations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : filteredOperations && filteredOperations.length > 0 ? (
            <div className="space-y-4">
              {filteredOperations.map((op) => (
                <div
                  key={op.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">
                          {op.operationNumber}
                        </span>
                        {getStatusBadge(op.status || "scheduled")}
                        {getTypeBadge(op.operationType || "maintenance")}
                        {getPriorityBadge(op.priority || "medium")}
                      </div>
                      <h3 className="font-medium text-lg">{op.title}</h3>
                      {op.description && (
                        <p className="text-sm text-muted-foreground mt-1">{op.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        {op.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {op.address}
                          </span>
                        )}
                        {op.scheduledDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(op.scheduledDate).toLocaleDateString("ar-SA")}
                          </span>
                        )}
                        {op.assignedWorkerId && (
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            عامل #{op.assignedWorkerId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {op.status === "scheduled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(op.id, "in_progress")}
                        >
                          <Play className="h-4 w-4 ml-1" />
                          بدء
                        </Button>
                      )}
                      {op.status === "in_progress" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(op.id, "on_hold")}
                          >
                            <Pause className="h-4 w-4 ml-1" />
                            تعليق
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(op.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4 ml-1" />
                            إكمال
                          </Button>
                        </>
                      )}
                      {op.status === "on_hold" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(op.id, "in_progress")}
                        >
                          <Play className="h-4 w-4 ml-1" />
                          استئناف
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedOperation(op)}
                        title="عرض"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingOperation(op)}
                        title="تعديل"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm("هل أنت متأكد من حذف هذه العملية؟")) {
                            deleteMutation.mutate({ id: op.id } as any);
                          }
                        }}
                        title="حذف"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>لا توجد عمليات</p>
              <Button variant="link" onClick={() => setIsCreateOpen(true)}>
                إنشاء عملية جديدة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operation Details Dialog */}
      <Dialog open={!!selectedOperation} onOpenChange={() => setSelectedOperation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل العملية</DialogTitle>
          </DialogHeader>
          {selectedOperation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">رقم العملية</Label>
                  <p className="font-mono">{selectedOperation.operationNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">الحالة</Label>
                  <div>{getStatusBadge(selectedOperation.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">النوع</Label>
                  <div>{getTypeBadge(selectedOperation.operationType)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">الأولوية</Label>
                  <div>{getPriorityBadge(selectedOperation.priority)}</div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">العنوان</Label>
                  <p className="font-medium">{selectedOperation.title}</p>
                </div>
                {selectedOperation.description && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">الوصف</Label>
                    <p>{selectedOperation.description}</p>
                  </div>
                )}
                {selectedOperation.address && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground">الموقع</Label>
                    <p>{selectedOperation.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Operation Dialog */}
      <Dialog open={!!editingOperation} onOpenChange={() => setEditingOperation(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل العملية</DialogTitle>
          </DialogHeader>
          {editingOperation && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              updateMutation.mutate({
                id: editingOperation.id,
                data: {
                  title: (formData as any).get("title") as string,
                  description: (formData as any).get("description") as string || undefined,
                  address: (formData as any).get("address") as string || undefined,
                  priority: (formData as any).get("priority") as any,
                  scheduledDate: (formData as any).get("scheduledDate") as string || undefined,
                  assignedTeamId: (formData as any).get("teamId") ? Number((formData as any).get("teamId")) : undefined,
                  assignedWorkerId: (formData as any).get("workerId") ? Number((formData as any).get("workerId")) : undefined,
                },
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">عنوان العملية *</Label>
                  <Input id="edit-title" name="title" required defaultValue={editingOperation.title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-operationType">نوع العملية *</Label>
                  <Select name="operationType" defaultValue={editingOperation.operationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="installation">تركيب</SelectItem>
                      <SelectItem value="maintenance">صيانة</SelectItem>
                      <SelectItem value="inspection">فحص</SelectItem>
                      <SelectItem value="disconnection">فصل</SelectItem>
                      <SelectItem value="reconnection">إعادة توصيل</SelectItem>
                      <SelectItem value="meter_reading">قراءة عداد</SelectItem>
                      <SelectItem value="collection">تحصيل</SelectItem>
                      <SelectItem value="repair">إصلاح</SelectItem>
                      <SelectItem value="replacement">استبدال</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">الأولوية</Label>
                  <Select name="priority" defaultValue={editingOperation.priority || "medium"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="urgent">عاجلة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-scheduledDate">تاريخ التنفيذ</Label>
                  <Input id="edit-scheduledDate" name="scheduledDate" type="date" defaultValue={editingOperation.scheduledDate?.split("T")[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-teamId">الفريق المكلف</Label>
                  <Select name="teamId" defaultValue={editingOperation.assignedTeamId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفريق" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-workerId">العامل المكلف</Label>
                  <Select name="workerId" defaultValue={editingOperation.assignedWorkerId?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العامل" />
                    </SelectTrigger>
                    <SelectContent>
                      {workers?.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id.toString()}>
                          {worker.nameAr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-address">العنوان</Label>
                  <Input id="edit-address" name="address" defaultValue={editingOperation.address} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea id="edit-description" name="description" defaultValue={editingOperation.description} rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingOperation(null)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
