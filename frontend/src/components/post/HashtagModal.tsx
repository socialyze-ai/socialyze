import { useState, useEffect } from "react";
import ModalWrapper from "../generic/ModalWrapper";
import { Hash, X, Plus, Trash, Loader2, Edit } from "lucide-react";
import { Button } from "../ui/button";
import HashtagInput from "./HashtagInput";
import { useDispatch, useSelector } from "react-redux";
import {
  addHashtagGroup,
  removeHashtagGroup,
  insertHashtagsFromGroup,
  selectPostCreation,
  addHashtagGroupsFromApi,
  selectContentByChannel,
  selectActiveChannel,
  selectIsCustomContent,
  setContentForChannel,
  setContent,
} from "@/redux/slices/postCreation.slice";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  useGetHashtagManagers,
  useCreateHashtagManager,
  useDeleteHashtagManager,
  useUpdateHashtagManager,
  HashtagManagerType,
  CreateHashtagManagerPayload,
} from "@/api/apiHooks/useHashtag";

const HashtagModal = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { hashtagGroups, hashtags } = useSelector(selectPostCreation);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupHashtags, setNewGroupHashtags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const contentByChannel = useSelector(selectContentByChannel);
  const activeChannel = useSelector(selectActiveChannel);
  const isCustomContent = useSelector(selectIsCustomContent);

  // Fetch hashtag managers from API
  const {
    data: hashtagManagers,
    isLoading: isHashtagManagersLoading,
    isError: isHashtagManagersError,
    error: hashtagManagersError,
  } = useGetHashtagManagers();

  // API mutations
  const {
    mutate: createHashtagManager,
    isPending: isCreateHashtagManagerPending,
    error: createHashtagManagerError,
  } = useCreateHashtagManager();

  const {
    mutate: deleteHashtagManager,
    isPending: isDeleteHashtagManagerPending,
    error: deleteHashtagManagerError,
  } = useDeleteHashtagManager();

  const {
    mutate: updateHashtagManager,
    isPending: isUpdateHashtagManagerPending,
    error: updateHashtagManagerError,
  } = useUpdateHashtagManager();

  // Sync hashtag managers from API to Redux store
  useEffect(() => {
    if (hashtagManagers && hashtagManagers.length > 0) {
      dispatch(
        addHashtagGroupsFromApi(
          hashtagManagers.map((manager) => ({
            _id: manager._id,
            name: manager.name,
            hashtags: manager.hashtags,
          })),
        ),
      );

      if (hashtagManagers.length > 0 && hashtagManagers[0].workspace) {
        setWorkspaceId(hashtagManagers[0].workspace);
      }
    }
  }, [hashtagManagers]);

  // Show errors as toasts
  useEffect(() => {
    if (isHashtagManagersError && hashtagManagersError) {
      toast({
        title: "Error fetching hashtag groups",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [isHashtagManagersError, hashtagManagersError, toast]);

  const handleSaveGroup = () => {
    if (newGroupName.trim() && newGroupHashtags.length > 0) {
      const payload: CreateHashtagManagerPayload = {
        name: newGroupName.trim(),
        workspace: workspaceId,
        hashtags: newGroupHashtags,
      };

      if (editingGroupId) {
        updateHashtagManager(
          { id: editingGroupId, payload },
          {
            onSuccess: (data) => {
              dispatch(
                addHashtagGroup({
                  _id: data._id,
                  name: data.name,
                  hashtags: data.hashtags,
                }),
              );
              resetForm();
              toast({
                title: "Hashtag Group Updated",
                description: `Your hashtag group "${newGroupName}" has been updated.`,
              });
            },
            onError: (error) => {
              toast({
                title: "Error updating hashtag group",
                description: "Please try again later.",
                variant: "destructive",
              });
            },
          },
        );
      } else {
        createHashtagManager(payload, {
          onSuccess: (data) => {
            dispatch(
              addHashtagGroup({
                _id: data._id,
                name: data.name,
                hashtags: data.hashtags,
              }),
            );
            resetForm();
            toast({
              title: "Hashtag Group Saved",
              description: `Your hashtag group "${newGroupName}" has been saved.`,
            });
          },
          onError: (error) => {
            toast({
              title: "Error saving hashtag group",
              description: "Please try again later.",
              variant: "destructive",
            });
          },
        });
      }
    }
  };

  const resetForm = () => {
    setEditingGroupId(null);
    setNewGroupName("");
    setNewGroupHashtags([]);
    setIsFormVisible(false);
  };

  const handleEditGroup = (groupId: string) => {
    const groupToEdit = hashtagManagers?.find((group) => group._id === groupId);
    if (groupToEdit) {
      setNewGroupName(groupToEdit.name);
      setNewGroupHashtags(groupToEdit.hashtags);
      setEditingGroupId(groupId);
      setIsFormVisible(true);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteHashtagManager(groupId, {
      onSuccess: () => {
        dispatch(removeHashtagGroup(groupId));
        toast({
          title: "Hashtag Group Deleted",
          description: "The hashtag group has been removed.",
        });
      },
      onError: (error) => {
        toast({
          title: "Error deleting hashtag group",
          description: "Please try again later.",
          variant: "destructive",
        });
      },
    });
  };

  const handleInsertHashtags = (groupId: string) => {
    const groupToInsert = hashtagManagers?.find((group) => group._id === groupId);

    if (groupToInsert) {
      const existsInRedux = hashtagGroups.some((g) => g._id === groupId);
      if (!existsInRedux) {
        dispatch(
          addHashtagGroup({
            _id: groupToInsert._id,
            name: groupToInsert.name,
            hashtags: groupToInsert.hashtags,
          }),
        );
      }

      if (isCustomContent) {
        const channelContent = contentByChannel[activeChannel] || "";
        dispatch(
          setContentForChannel({
            channelId: activeChannel,
            content:
              channelContent + "\n" + groupToInsert.hashtags.map((tag) => `#${tag}`).join(" "),
          }),
        );
      } else {
        const content = contentByChannel[activeChannel] || "";
        dispatch(
          setContent(content + "\n" + groupToInsert.hashtags.map((tag) => `#${tag}`).join(" ")),
        );
      }
    }

    dispatch(insertHashtagsFromGroup(groupId));
  };

  const displayGroups = hashtagManagers || hashtagGroups;

  const filteredGroups = displayGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderContent = () => {
    if (isFormVisible) {
      return (
        <div className="flex flex-col gap-4">
          <HashtagInput
            hashtags={newGroupHashtags}
            onHashtagsChange={setNewGroupHashtags}
            groupName={newGroupName}
            onGroupNameChange={setNewGroupName}
            showGroupNameInput={true}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              variant="outline"
              disabled={isCreateHashtagManagerPending || isUpdateHashtagManagerPending}
              onClick={handleSaveGroup}
            >
              {isCreateHashtagManagerPending || isUpdateHashtagManagerPending
                ? "Saving..."
                : editingGroupId
                ? "Update Group"
                : "Save Group"}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col w-full gap-4">
        {isHashtagManagersLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isHashtagManagersError && !isHashtagManagersLoading && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">
              Failed to load hashtag groups. Please try again.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        )}

        {!isHashtagManagersLoading && !isHashtagManagersError && (
          <>
            <div className="flex justify-between items-center">
              {hashtagManagers?.length !== 0 && (
                <input
                  type="text"
                  placeholder="Search by group name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded p-2"
                />
              )}
              <Button variant="outline" onClick={() => setIsFormVisible(true)}>
                Create New Group
              </Button>
            </div>

            {filteredGroups.length > 0 ? (
              <div className="flex flex-col w-full gap-4 max-h-[50vh] overflow-y-auto">
                {filteredGroups.map((group) => (
                  <Card key={group._id} className="flex flex-col w-full">
                    <CardHeader className="p-2 px-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditGroup(group._id)}
                            disabled={isUpdateHashtagManagerPending}
                          >
                            {isUpdateHashtagManagerPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Edit className="w-fit text-gray-500" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGroup(group._id)}
                            disabled={isDeleteHashtagManagerPending}
                          >
                            {isDeleteHashtagManagerPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="w-fit text-red-500" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex justify-between p-3">
                      <div className="flex flex-wrap gap-1">
                        {group.hashtags.map((tag, idx) => (
                          <span key={idx} className="bg-muted rounded-md px-2 py-0.5 text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="p-2 flex justify-end">
                      <Button
                        size="sm"
                        className="w-fit self-end"
                        onClick={() => handleInsertHashtags(group._id)}
                      >
                        Insert Hashtags
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              searchTerm && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No hashtag groups found matching "{searchTerm}".
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <ModalWrapper
      title={
        isFormVisible ? (editingGroupId ? "Edit Group" : "Create New Group") : "Hashtag Manager"
      }
      description={
        isFormVisible
          ? "Edit your hashtag group details"
          : "Create and manage hashtag groups for your posts"
      }
      triggerButtonText={<Hash className="h-5 w-5" />}
      triggerButtonProps={{ size: "icon" }}
      dialogContentClassName="max-w-lg"
    >
      {renderContent()}
    </ModalWrapper>
  );
};

export default HashtagModal;
