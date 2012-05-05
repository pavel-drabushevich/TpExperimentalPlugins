namespace AngryClient

open System.Runtime.Serialization
open NServiceBus
open Tp.Integration.Plugin.Common
open Tp.Integration.Plugin.Common.Validation

[<assembly:PluginAssembly("AngryClient", "This plugin automatically set angriness value for request.", "Helpers")>]
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

    member private this.ValidateProject(errors: PluginProfileErrorCollection) =
        if this.Project <= 0 then 
            errors.Add(new PluginProfileError(FieldName = "Project", Message = "Project should not be empty"))
        else ()
