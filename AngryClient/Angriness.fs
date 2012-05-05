namespace AngryClient

open System
open System.Runtime.Serialization
open NServiceBus
open Tp.Integration.Common
open Tp.Integration.Plugin.Common
open Tp.Integration.Plugin.Common.Validation
open Tp.Integration.Messages.EntityLifecycle
open Tp.Integration.Messages.EntityLifecycle.Messages
open Tp.Integration.Messages.EntityLifecycle.Commands
open NServiceBus.Saga
open Tp.Integration.Plugin.Common.Activity

type public UpdateRequest (_request, _changedFields) =
    interface IUpdateEntityCommand<DataTransferObject> with
        member this.Dto 
            with get() = _request
        member this.ChangedFields 
            with get() = _changedFields


type public AngryRequestSaga (_bus: ICommandBus, _logger: IActivityLogger) =  

    member public this.Handle(message) = (this :> IHandleMessages<RequestCreatedMessage>).Handle(message)

    interface IHandleMessages<RequestCreatedMessage> with
        member this.Handle(message) = 
            let request = message.Dto
            let angryRequest = new RequestDTO(ID = request.ID, CustomField1 = AngryRequestSaga.CalculateAngriness(request))
            let updateRequest = new UpdateRequest(angryRequest, [| RequestField.CustomField1 |]);
            _bus.Send(updateRequest) |> ignore
            _logger.InfoFormat("Set angriness to request {0}", request.ID)

    static member private CalculateAngriness(request : RequestDTO) =
        request.Name.Length.ToString()

