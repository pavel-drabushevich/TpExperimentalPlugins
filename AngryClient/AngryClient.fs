namespace AngryClient

open System.Runtime.Serialization
open NServiceBus
open Tp.Integration.Plugin.Common
open Tp.Integration.Plugin.Common.Validation
open Tp.Integration.Messages.EntityLifecycle.Messages

[<assembly:PluginAssembly("AngryClient")>]
do()

[<Profile; DataContract>]
type public Profile () =

    let mutable _project = 0
    [<DataMember>]
    member this.Project 
        with get() = _project
        and set(value) = _project <- value

    interface IValidatable with
      member this.Validate errors = 
        this.ValidateProject errors |> ignore

    member this.ValidateProject(errors: PluginProfileErrorCollection) =
        if this.Project <= 0 then 
            let error = PluginProfileError()
            error.FieldName <- "Project"
            error.Message <- "Project should not be empty"
            errors.Add(error)
        else ()

type public SetRequestValueHandler (bus: ICommandBus) =  

    interface IHandleMessages<RequestCreatedMessage> with
        member this.Handle(message: RequestCreatedMessage) = 
            ()
